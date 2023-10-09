import Icon from "@mdi/react";

interface IconProps {
  size: number;
  color: string;
  path: string;
  className?: string
  spin?: boolean;
}
export default function MdIcon(props: IconProps) {

  return <Icon path={props.path} size={props.size} color={props.color} className={props.className} spin={props.spin} />;
}
