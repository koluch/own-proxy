import { h, JSX, VNode } from "preact";
import cn from "classnames";
import {
  DomainSettingsDict,
  UseProxyMode,
  UseProxyModeValues,
} from "../common/observables/settings";
import { useState } from "preact/hooks";
import s from "./DomainSettings.postcss";

const DEFAULT_USE_MODE: UseProxyMode = "ALWAYS";

function TableRow(props: {
  children: VNode | VNode[];
  className?: string;
}): VNode {
  return <div className={cn(s.row, props.className)}>{props.children}</div>;
}

function TableItem(props: {
  children: VNode | VNode[];
  className?: string;
}): VNode {
  return <div className={cn(s.item, props.className)}>{props.children}</div>;
}

interface NewItem {
  domain: string;
  useProxy: UseProxyMode;
}
export default function DomainSettings(props: {
  domainSettingsDict: DomainSettingsDict;
  setDomainSettingsDict: (domainSettings: DomainSettingsDict) => void;
}): VNode {
  const { domainSettingsDict, setDomainSettingsDict } = props;

  const newItemInitialState = {
    domain: "",
    useProxy: DEFAULT_USE_MODE,
  };
  const [newItem, setNewItem] = useState<NewItem>(newItemInitialState);

  function handleAdd(): void {
    setDomainSettingsDict({
      ...domainSettingsDict,
      [newItem.domain]: {
        useProxy: newItem.useProxy,
      },
    });
    setNewItem(newItemInitialState);
  }

  return (
    <div className={s.root}>
      {Object.keys(domainSettingsDict).map(domain => {
        const domainSettings = domainSettingsDict[domain];
        if (domainSettings == null) {
          throw new Error(`This should never happen`);
        }

        function handleUseProxyChange(
          e: JSX.TargetedEvent<HTMLSelectElement>,
        ): void {
          const value = e.currentTarget.value || DEFAULT_USE_MODE;
          setDomainSettingsDict({
            ...domainSettingsDict,
            [domain]: {
              ...domainSettings,
              useProxy: value as UseProxyMode,
            },
          });
        }

        function handleDelete(): void {
          const newDict: DomainSettingsDict = {};
          for (const [nextDomain, nextSettings] of Object.entries(
            domainSettingsDict,
          )) {
            if (domain !== nextDomain) {
              newDict[nextDomain] = nextSettings;
            }
          }
          setDomainSettingsDict(newDict);
        }

        return (
          <TableRow key={domain}>
            <TableItem className={cn(s.domain)}>
              <div>{domain}</div>
            </TableItem>
            <TableItem className={cn(s.useProxy)}>
              <select
                value={domainSettings.useProxy}
                className={cn("browser-style", s.useProxySelect)}
                onInput={handleUseProxyChange}
              >
                {UseProxyModeValues.map(value => (
                  <option value={value}>{value}</option>
                ))}
              </select>
            </TableItem>
            <TableItem className={cn(s.delete)}>
              <button
                className={cn("browser-style", s.deleteButton)}
                onClick={handleDelete}
              >
                Delete
              </button>
            </TableItem>
          </TableRow>
        );
      })}
      <TableRow>
        <TableItem className={cn(s.domain)}>
          <input
            className={cn(s.domainInput)}
            value={newItem.domain}
            placeholder="Domain"
            onInput={e => {
              setNewItem({
                ...newItem,
                domain: e.currentTarget?.value || "",
              });
            }}
          />
        </TableItem>
        <TableItem>
          <select
            value={newItem.useProxy}
            className={cn("browser-style", s.useProxySelect)}
            onChange={e => {
              setNewItem({
                ...newItem,
                useProxy: (e.currentTarget?.value ||
                  DEFAULT_USE_MODE) as UseProxyMode,
              });
            }}
          >
            {UseProxyModeValues.map(value => (
              <option value={value}>{value}</option>
            ))}
          </select>
        </TableItem>
        <TableItem>
          <button
            className={cn("browser-style", s.deleteButton)}
            onClick={handleAdd}
            disabled={newItem.domain === ""}
          >
            Add
          </button>
        </TableItem>
      </TableRow>
    </div>
  );
}
