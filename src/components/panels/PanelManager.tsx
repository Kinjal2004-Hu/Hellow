import { YouTubePanel } from "./YouTubePanel";
import { GmailPanel } from "./GmailPanel";
import { SearchPanel } from "./SearchPanel";

export function PanelManager() {
  return (
    <>
      <YouTubePanel />
      <GmailPanel />
      <SearchPanel />
    </>
  );
}
