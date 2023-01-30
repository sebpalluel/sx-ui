import { ref } from 'vue';
import WalletConnect from '@walletconnect/client';
import { Interface } from '@ethersproject/abi';
import { formatUnits } from '@ethersproject/units';
import { getABI } from '@/helpers/etherscan';
import { createContractCallTransaction } from '@/helpers/transactions';

let connector;

function parseTransaction(call, abi) {
  const iface = new Interface(abi);
  return JSON.parse(JSON.stringify(iface.parseTransaction(call)));
}

async function parseCall(call) {
  console.log('Call', call);
  if (call.method === 'eth_sendTransaction') {
    console.log('Send transaction');
    const params = call.params[0];
    const abi = await getABI(params.to);
    console.log('Got ABI contract');
    const tx = parseTransaction(params, abi);
    return createContractCallTransaction({
      form: {
        to: params.to,
        abi,
        recipient: params.to,
        method: tx.signature,
        args: tx.args,
        amount: formatUnits(params.value || 0)
      }
    });
    //     console.log('Tx', tx);
    //     return [
    //       {
    //         to: params.to,
    //         value: formatUnits(params.value || 0),
    //         method: tx.signature,
    //         params: tx.args,
    //         operation: 0,
    //         _data: {
    //           call,
    //           tx
    //         }
    //       }
    //     ];
  }
  return false;
}

export function useWalletConnect(address: string, network = 1) {
  const requests = ref([]);
  const logged = ref(false);
  const loading = ref(false);

  async function logout() {
    await connector.killSession();
    logged.value = false;
  }

  async function connect(uri) {
    loading.value = true;
    connector = new WalletConnect({
      uri,
      storageId: Math.random().toString()
    });
    connector.killSession();
    connector.on('session_request', async (error, payload) => {
      console.log('session_request', error, payload);
      if (error) throw error;
      await connector.approveSession({
        accounts: [address],
        chainId: network
      });
      console.log('Connected');
      logged.value = true;
      loading.value = false;
    });

    // Subscribe to call requests
    connector.on('call_request', async (error, payload) => {
      console.log('Call request', error, payload);
      if (error) throw error;
      try {
        const request: any = await parseCall(payload);
        console.log('Request', request);
        // @ts-ignore
        if (request) requests.value.push(request);
      } catch (e) {
        console.log(e);
      }
    });

    connector.on('disconnect', (error, payload) => {
      console.log('disconnect', error, payload);
      if (error) throw error;
    });
  }

  return {
    parseCall,
    connect,
    logout,
    loading,
    logged,
    requests
  };
}
