<template>
  <Button v-bind="$attrs" :loading="loading" @click=handleClick>
    <template v-for="slot of Object.keys($slots)" #[slot]>
      <slot :name="slot"></slot>
    </template>
  </Button>
</template>

<script lang="ts" setup>
import { Button, ButtonProps } from 'ant-design-vue';
import { ref } from 'vue';

interface AsyncButtonProps extends ButtonProps {
  asyncClick: (event: MouseEvent) => Promise<void>;
}

const loading = ref(false);
const props = defineProps<AsyncButtonProps>();

const handleClick = async (event: MouseEvent) => {
  if (props.asyncClick) {
    loading.value = true;
    await props.asyncClick(event).finally(() => {
      loading.value = false;
    });
  }
};
</script>