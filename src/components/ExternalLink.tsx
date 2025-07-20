import { TouchableOpacity, Text, Platform } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';

type Props = ComponentProps<typeof TouchableOpacity> & {
  href: string;
  children?: React.ReactNode;
};

export function ExternalLink({ href, children, ...rest }: Props) {
  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await openBrowserAsync(href);
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} {...rest}>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}