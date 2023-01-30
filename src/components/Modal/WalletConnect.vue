<template>
  <UiModal :open="open" @close="$emit('close')">
    <template #header>
      <h3 v-text="'WalletConnect'" />
    </template>
    <div class="s-box p-4">
      <div class="relative">
        <UiLoading v-if="loading" class="absolute top-[14px] right-3 z-10" />
        <SIAddress
          v-model="wcURI"
          :error="''"
          :show-picker="false"
          :definition="{
            type: 'string',
            title: 'Connection Link',
            examples: ['e.g. wc:1a162dc8-f4fb...']
          }"
        />
      </div>
    </div>
    <template #footer>
      <UiButton class="w-full" @click="handleLogin">Confirm</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, Ref } from 'vue';
import { useWalletConnect } from '@/composables/useWalletConnect';

const props = defineProps({
  open: Boolean,
  initialState: Object,
  address: String,
  network: Number
});

const emit = defineEmits(['close', 'add']);

const wcURI = ref('');
const { connect, logout, loading, logged, requests, parseCall } = useWalletConnect(
  props.address as string,
  props.network
);

async function handleLogin() {
  await connect(wcURI.value);
//   emit('add', requests);
  emit('close');
}
</script>
