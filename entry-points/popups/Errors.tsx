import { h, VNode } from "preact";
import s from "./Errors.postcss";
import { ErrorMessage } from "../common/observables/errorLog";

interface Props {
  errors: ErrorMessage[];
}

export default function Errors(props: Props): VNode | null {
  const errors = [...props.errors];
  errors.sort((x, y) => y.time - x.time);
  return (
    <div className={s.root}>
      {errors.map(({ id, time, text }) => (
        <div key={id} className={s.item}>
          <span className={s.time}>{new Date(time).toLocaleTimeString()}</span>:{" "}
          {text}
        </div>
      ))}
    </div>
  );
}
