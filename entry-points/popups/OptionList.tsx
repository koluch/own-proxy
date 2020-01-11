import { UseProxyMode } from "../common/observables/settings";
import { h, VNode } from "preact";
import s from "./OptionList.postcss";
import cn from "classnames";

const OPTIONS: [string, { label: string }][] = [
  ["DEFAULT", { label: "Default behaviour" }],
  ["ALWAYS", { label: "Always proxy this site" }],
  ["NEVER", { label: "Never proxy this site" }],
];

export default function OptionList(props: {
  value: UseProxyMode | null;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isProxyUsedByDefault: boolean;
}): VNode {
  const { onChange, isProxyUsedByDefault, isDisabled } = props;
  return (
    <ul className={s.root}>
      {OPTIONS.map(([value, { label }]) => (
        <li className={s.option}>
          <input
            className={cn("browser-style")}
            name="domain_setting"
            value={value}
            type="radio"
            disabled={isDisabled}
            checked={props.value ? value === props.value : value === "DEFAULT"}
            onClick={() => onChange(value)}
          />
          <label className="browser-style" for="domain_proxy_default">
            {label}
            {value === "DEFAULT" && (
              <span id="default_behaviour">
                {" "}
                ({isProxyUsedByDefault ? "use proxy" : `don't use proxy`})
              </span>
            )}
          </label>
        </li>
      ))}
    </ul>
  );
}
