import { ref, defineComponent } from 'vue';
import { Button } from 'ant-design-vue';

export default defineComponent({
  name: 'AsyncButton',
  props: {
    asyncClick: {
      type: Function,
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
