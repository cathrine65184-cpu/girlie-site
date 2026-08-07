import { Text } from '@react-three/drei';

export function Ending({ count }) {
  return <group position={[0, .6, -32]}>
    <Text fontSize={.48} color="#fff5eb" anchorX="center" anchorY="middle">{count ? `${count} memory flowers are blooming` : 'A field is waiting for your memories'}</Text>
  </group>;
}
