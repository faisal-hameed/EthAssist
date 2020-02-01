class SignatureSelector
{

    constructor()
    {
        //No need to do anything here.
    }

    /**
     * Ticks/Unticks the checkbox based on the users setting
     */
    populateOptionCheckbox()
    {
        document.getElementById("ext-EthereumAssistant-signature_success").classList.add("hide-me");

        objBrowser.runtime.sendMessage({func: "signature_inject"}, function(objResponse) {
            document.getElementById("ext-EthereumAssistant-signature_modify_checkbox").checked = !!parseInt(objResponse.resp);
        });
    }

    saveFormValues(objEvent)
    {
        objEvent.preventDefault();

        var objSignatureInject = document.getElementById("ext-EthereumAssistant-signature_modify_checkbox");
        localStorage.setItem("ext-EthereumAssistant-signature_inject", objSignatureInject.checked ? 1 : 0);
        document.getElementById("ext-EthereumAssistant-signature_success").classList.remove("hide-me");
        return false;
    }

}

//On page load do everything.
(function() {
    let objSignatureSelector = new SignatureSelector();
    objSignatureSelector.populateOptionCheckbox();

    var objForm = document.getElementById("ext-EthereumAssistant-signature_modify_form");
    objForm.addEventListener("submit", objSignatureSelector.saveFormValues, true);
})();