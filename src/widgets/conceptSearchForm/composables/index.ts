import { Ref, ref } from "vue";
import { webApiActions } from "@/shared/api/webAPI";
import { useStore } from "vuex";

interface useConceptSearchForm {
  showWebApiSearchForm: Ref<boolean>;
  errors: Ref<string>;
  successMessage: Ref<string[]>;
  renderForm: () => void;
  closeForm: () => void;
  clearMessages: () => void;
}

export default function useConceptSearchForm(): useConceptSearchForm {
  const store = useStore();
  const successMessage: Ref<string[]> = ref([]);
  const errors: Ref<string> = ref("");
  const showWebApiSearchForm = ref(false);

  function renderForm() {
    showWebApiSearchForm.value = true;
  }
  //
  const clearMessages = function () {
    errors.value = "";
    successMessage.value = [];
  };
  //
  const closeForm = function () {
    showWebApiSearchForm.value = false;
    store.dispatch(webApiActions.RESET_API_STORAGE);
    successMessage.value = [];
  };

  return {
    showWebApiSearchForm,
    errors,
    successMessage,
    renderForm,
    closeForm,
    clearMessages,
  };
}
