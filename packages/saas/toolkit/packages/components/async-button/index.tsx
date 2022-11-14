import { ref, defineComponent } from 'vue';
import { Button, ButtonProps } from 'ant-design-vue';

interface AsyncButtonProps extends Omit<ButtonProps, 'onClick' | 'loading'> {
  onClick?: (event: MouseEvent) => Promise<any>;
}

export default defineComponent<AsyncButtonProps>({
  name: 'AsyncButton',
  setup(props) {
    const { onClick, ...otherProps } = props;
    const loading = ref(false);

    const handleClick = async (event: MouseEvent) => {
      if (onClick) {
        loading.value = true;
        await onClick(event).finally(() => {
          loading.value = false;
        });
      }
    };

    const buttonProps = {
      ...otherProps,
      loading: loading.value,
      onclick: handleClick,
    };

    // 返回渲染函数
    return <Button {...buttonProps} />;
  },
});
