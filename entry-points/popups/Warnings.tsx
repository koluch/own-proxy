import { h, VNode } from "preact";
import s from "./Warning.postcss";

export interface Warning {
  text: string;
  onClick: () => void;
}

interface Props {
  warnings: (Warning | false | null)[];
}

export default function Warnings(props: Props): VNode | null {
  const warnings: Warning[] = props.warnings.filter(
    (x): x is Warning => x !== null && x !== false,
  );

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className={s.root}>
      {warnings.map(warning => (
        <div className={s.item} onClick={warning.onClick}>
          {warning.text}
        </div>
      ))}
    </div>
  );
}
