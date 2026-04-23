import explorerStore from "@/widgets/explorer/model/store/explorer.module";
import Explorer from "@/widgets/explorer/ui/Explorer.vue";
import * as explorerActions from "./model/store/actions.type";

export const EXPLORER_CONTENT_TARGET = "#explorer-content-slot";

export { explorerStore, Explorer, explorerActions };
