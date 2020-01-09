import { h, JSX, VNode } from "preact";
import cn from "classnames";
import {
  DomainSettingsDict,
  UseProxyMode,
  UseProxyModeValues,
} from "../common/observables/settings";
import { useState } from "preact/hooks";

const DEFAULT_USE_MODE: UseProxyMode = "ALWAYS";

function TableRow(props: {
  children: VNode | VNode[];
  className?: string;
}): VNode {
  return (
    <div className={cn("domainSettingsRow", props.className)}>
      {props.children}
    </div>
  );
}

function TableItem(props: {
  children: VNode | VNode[];
  className?: string;
}): VNode {
  return (
    <div className={cn("domainSettingsItem", props.className)}>
      {props.children}
    </div>
  );
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
    <div className={cn("domainSettings")}>
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
            <TableItem className={cn("domainSettingsItemDomain")}>
              <div>{domain}</div>
            </TableItem>
            <TableItem className={cn("domainSettingsItemUseProxy")}>
              <select
                value={domainSettings.useProxy}
                className={cn(
                  "browser-style",
                  "domainSettingsItemUseProxySelect",
                )}
                onInput={handleUseProxyChange}
              >
                {UseProxyModeValues.map(value => (
                  <option value={value}>{value}</option>
                ))}
              </select>
            </TableItem>
            <TableItem className={cn("domainSettingsItemDelete")}>
              <button
                className={cn(
                  "browser-style",
                  "domainSettingsItemDeleteButton",
                )}
                onClick={handleDelete}
              >
                Delete
              </button>
            </TableItem>
          </TableRow>
        );
      })}
      <TableRow>
        <TableItem className={cn("domainSettingsItemDomain")}>
          <input
            className={cn("domainSettingsItemDomainInput")}
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
        <TableItem className={cn("domainSettingsItem")}>
          <select
            value={newItem.useProxy}
            className={cn("browser-style", "domainSettingsItemUseProxySelect")}
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
        <TableItem className={cn("domainSettingsItem")}>
          <button
            className={cn("browser-style", "domainSettingsItemDeleteButton")}
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
