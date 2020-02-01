const labels = new Labels();

const createExtensionInstance = () => new EthereumAssistant(Web3, labels);

window.addEventListener("load", function() {
    const objEthereumAssistant = createExtensionInstance();
});

//Send message from the extension to here.
objBrowser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let objEthereumAssistant = createExtensionInstance();

        if (typeof request.func !== "undefined") {
            if(typeof objEthereumAssistant[request.func] == "function") {
                objEthereumAssistant[request.func]();
                sendResponse({status: "ok"});
                return true;
            }
        }

        sendResponse({status: "fail"});
    }
);
