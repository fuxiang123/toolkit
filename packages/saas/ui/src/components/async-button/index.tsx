import { ref, defineComponent, PropType } from 'vue';
import { Button } from 'ant-design-vue';
import { buttonProps } from 'ant-design-vue/lib/button/buttonTypes';

export default defineComponent({
  name: 'AsyncButton',
  props: {
    ...buttonProps(),
    asyncClick: {
      type: Function as PropType<(event: MouseEvent) => Promise<void>>,
    },
  },
  setup(props, { slots }) {
    const loading = ref(false);

    const handleClick = async (event: MouseEvent) => {
      if (props.asyncClick) {
        loading.value = true;
        await props.asyncClick(event).finally(() => {
          loading.value = false;
        });
      }
    };

    // 返回渲染函数
    return () => (
      <Button {...props} loading={loading.value} onClick={handleClick}>
        {slots}
      </Button>
    );
  },
});
