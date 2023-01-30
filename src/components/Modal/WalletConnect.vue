<template>
  <UiModal :open="open" @close="$emit('close')">
    <template #header>
      <h3 v-text="'WalletConnect'" />
    </template>
    <div class="s-box p-4">
      <a
        v-if="logged"
        :href="explorerUrl(network, address as string)"
        target="_blank"
        class="block"
      >
        <UiButton class="button-outline w-full flex justify-center items-center">
          <Stamp :id="address" :size="18" class="mr-2 -ml-1" />
          <span v-text="shorten(address as string)" />
          <IH-external-link class="inline-block ml-1" />
        </UiButton>
      </a>
      <SIAddress
        v-else
        v-model="wcURI"
        :error="error"
        :show-picker="false"
        :definition="{
          type: 'string',
          title: 'Connection Link',
          examples: ['e.g. wc:1a162dc8-f4fb...']
        }"
      />
    </div>
    <template #footer>
      <UiButton v-if="logged" class="button-outline w-full !text-red" @click="handleLogout">
        Log out
      </UiButton>
      <UiButton v-else v-bind="{ loading }" class="w-full" @click="handleLogin">Confirm</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, Ref } from 'vue';
import { useWalletConnect } from '@/composables/useWalletConnect';
import { shorten, explorerUrl, getUrl } from '@/helpers/utils';

const props = defineProps({
  open: Boolean,
  initialState: Object,
  address: String,
  network: Number
});

const emit = defineEmits(['close', 'add']);

const wcURI = ref('');
const error = ref('');
const { connect, logout, loading, logged, requests, parseCall } = useWalletConnect(
  props.address as string,
  props.network
);

async function handleLogin() {
  try {
    await connect(wcURI.value);
    //   emit('add', requests);
    error.value = '';
    emit('close');
  } catch (e: any) {
    console.error({ e });
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
async function handleLogout() {
  await logout();
  wcURI.value = '';
}
</script>
