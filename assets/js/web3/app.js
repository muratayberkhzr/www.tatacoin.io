App = {
    init: async () => {
        //return await App.initWeb3();
        return await App.initWeb3Modal();
    },
    initWeb3: async () => {
        try {
            App.web3 = new Web3('https://bsc-dataseed1.binance.org')
            //return App.initContracts();
        } catch (error) {
            alert("Enable to access to Metamask");
            console.log(error);
        }
    },
    initWeb3Modal: async () => {

        try {
            const Web3Modal = window.Web3Modal.default;
            App.web3Modal = new Web3Modal({
                cacheProvider: true, // optional
                //theme: "dark",
                providerOptions: App.getProviderOptions() // required
            })

            App.provider = await App.web3Modal.connect();
            console.log('provider', App.provider);
            if (typeof App.provider !== 'undefined') {
                App.web3 = new Web3(App.provider);
            }
            //return App.initContracts();
        } catch (error) {
            console.log(error, "Enable to access to Metamask");
        }
    },
    getProviderOptions: () => {
        const WalletConnectProvider = window.WalletConnectProvider.default;
        return {
            walletconnect: {
                package: WalletConnectProvider,
                options :{
                    rpc: {
                        56: "https://bsc-dataseed1.ninicoin.io",
                        97: "https://data-seed-prebsc-1-s1.binance.org:8545",
                    },
                    bridge: "https://u.bridge.walletconnect.org",
                    chainId: 56,
                    //network: "binance",
                }
            }
        }
    },
    initContracts: async () => {
        App.networkId = await App.web3.eth.net.getId();
        if (App.networkId !== 56) {
            alert("Please switch to Binance Smart Chain");
            return;
        }
        const row = await App.getPresaleInfo(tokenInfo.presaleAddress);
        App.render(row);
    },
    connectWallet: async (btn) => {
        await App.initWeb3Modal()
        //if (typeof ethereum !== 'undefined')
        {
            //const web3 = new Web3(ethereum);
            const web3 = App.web3;
            console.log('web3', web3);
            //const netId = await web3.eth.net.getId()
            accounts = await web3.eth.getAccounts()
            //load balance
            console.log('accounts', accounts);
            if(typeof accounts[0] !=='undefined'){
                App.connected(accounts)
            } else {
                if(btn) {
                    accounts = await ethereum.request({method: 'eth_requestAccounts'});
                    App.connected(accounts)
                }
                const response = {status: false, message: 'Please login with MetaMask'};
                console.log(response.message);
                return response;
            }
        }/* else {
            const response = {status: false, message: 'Please install MetaMask'};
            console.log(response.message);
            return response;
        }*/
    },
    connected: async (accounts) => {
        App.provider.on('accountsChanged', async function (accounts) {
            //accounts = await App.web3.eth.getAccounts()
            console.log('account-account', accounts);
            if(accounts.length === 0){
                $('.connect-web3').addClass('btn-grad').removeClass('btn-grad-o').html('Connect Wallet');
                $('.update-profile-btn').hide(0);
                $('input[name=csrf_token]').val('')
            } else {
                $('.connect-web3').addClass('btn-grad-o').removeClass('btn-grad').html('Connected');
                $('.update-profile-btn').show(0);
                $('input[name=csrf_token]').val(accounts[0])
            }
        })

        if(accounts.length === 0) {
            $('.connect-web3').addClass('btn-grad').removeClass('btn-grad-o').html('Connect Wallet');
            $('.update-profile-btn').hide(0);
            $('input[name=csrf_token]').val('')
        } else {
            $('.connect-web3').addClass('btn-grad-o').removeClass('btn-grad').html('Connected');
            $('.update-profile-btn').show(0);
            $('input[name=csrf_token]').val(accounts[0])
        }
    },
    addToMetamask: async (btn) => {
        if (typeof ethereum !== 'undefined') {
            ethereum.request({
                    method: 'metamask_watchAsset', params: {
                        "type": "ERC20",
                        "options": {
                            "address": tokenInfo.address,
                            "symbol": tokenInfo.symbol,
                            "decimals": tokenInfo.decimals,
                            "image": tokenInfo.image
                        },
                    },
                    id: Math.round(Math.random() * 100000)
                },
                (err, added) => {
                    console.log('provider returned', err, added)
                    if (err || 'error' in added) {
                        alert("There was a problem adding the token.")
                        return false
                    }
                    //Toast.fire({icon: 'success', title: "Token has been added successfully!"});
                })
        } else {
            const response = {status: false, message: 'Please install MetaMask'};
            console.log(response.message);
            return response;
        }
    },
    getPresaleInfo: async (address, account = null) => {
        //if (typeof ethereum !== 'undefined')
        {
            const web3 = App.web3;
            if(account === null && typeof ethereum !== 'undefined'){
                const accounts = await web3.eth.getAccounts()
                account = accounts[0];
            }

            const contract = new web3.eth.Contract(SALE_ABI, address);
            const token = await contract.methods.token().call();

            const balanceToken = await contract.methods.balanceToken().call();
            //const depositToken = await contract.methods._depositToken().call();

            const sale_rate = await contract.methods.rate().call();
            const listing_price = await contract.methods.listingRate().call();
            const liquidity = await contract.methods.liquidityLock().call();
            const liquidityLockTime = await contract.methods.liquidityLockTime().call();

            const soft_cap = web3.utils.fromWei(await contract.methods.goal().call());
            const hard_cap = web3.utils.fromWei(await contract.methods.cap().call());

            const start_time = await contract.methods.openingTime().call();
            const end_time = await contract.methods.closingTime().call();

            const contribute_min = web3.utils.fromWei(await contract.methods.contributeMin().call());
            const contribute_max = web3.utils.fromWei(await contract.methods.contributeMax().call());

            const weiRaised = web3.utils.fromWei(await contract.methods.weiRaised().call());
            const hasClosed = await contract.methods.hasClosed().call();
            const isOpen = await contract.methods.isOpen().call();
            const goalReached = await contract.methods.goalReached().call();
            const finalized = await contract.methods.finalized().call();


            const contributed_tokens = 0;//web3.utils.fromWei(await contract.methods.balanceOf(account).call());
            const contributed_bnb = 0;//web3.utils.fromWei(await contract.methods.depositsOf(account).call());

            const _row = {token, weiRaised, balanceToken, listing_price, sale_rate, liquidity, liquidityLockTime
                , soft_cap, hard_cap, start_time, end_time, contribute_min, contribute_max, contributed_bnb, contributed_tokens
                , hasClosed, isOpen, finalized, goalReached
            };

            _row.raised_percentage = (weiRaised * 100 / _row.hard_cap);

            const tz = 'America/Los_Angeles';
            _row.start_time_left = moment.duration(moment.utc(moment.unix(start_time)).diff(moment.utc())).asSeconds() * 1000;
            _row.end_time_left = moment.duration(moment.utc(moment.unix(end_time)).diff(moment.utc())).asSeconds() * 1000;

            const calc = {
                sale: _row.hard_cap * _row.sale_rate,
                listing: ((_row.hard_cap * _row.liquidity / 100) * listing_price),
                fee: ((_row.hard_cap * _row.sale_rate) * 2 / 100),
            }
            calc.extra = ((calc.sale + calc.listing + calc.fee)  * 2 / 100);
            _row._tokens = calc;
            _row.presale_tokens = (calc.sale + calc.listing + calc.fee + calc.extra);

            _row.status = 'Pending';
            if(_row.isOpen && balanceToken > 0){
                _row.status = 'Live';
            } else if(balanceToken > 0){
                _row.status = 'Waiting';
            }
            if(_row.hasClosed && !goalReached) {
                _row.status = 'Failed';
            }  else if(_row.hasClosed && goalReached) {
                _row.status = 'Success';
            }
            console.log('_row', _row);
            App.presale = _row;
            return _row;
        }
    },
    render: async (row) => {
        $('.ps-raised').html(`${BigNumber(row.weiRaised).dp(4).toFormat()} BNB`);
        $('.ps-soft_cap').html(`${BigNumber(row.soft_cap).toFormat()} BNB`);
        $('.ps-hard_cap').html(`${BigNumber(row.hard_cap).toFormat()} BNB`);
        $('.ps-contribute_min').html(row.contribute_min);
        $('.ps-contribute_max').html(row.contribute_max);
        $('.ps-start_time').html(moment.unix(row.start_time).format('Do MMM YYYY, HH:mm'));
        $('.ps-end_time').html(moment.unix(row.end_time).format('Do MMM YYYY, HH:mm'));
        $('.ps-presale_tokens').html(BigNumber(row.presale_tokens).toFormat());
        $('.ps-sale_rate').html(BigNumber(row.sale_rate).toFormat());

        $('.ps-raised_percentage').attr('data-percent', row.raised_percentage).css({'width': `${(row.raised_percentage + 25)}%`});
        if(row.isOpen && row.start_time_left > 0){
            //$('.ps-countdown').attr('data-date', moment.unix(row.start_time).format('YYYY/MM/DD HH:mm'));
            $('.ps-time_status').html('Start In');
        } else if(row.isOpen && row.start_time_left < 0 && row.end_time_left > 0){
            //$('.ps-countdown').attr('data-date', moment.unix(row.end_time).format('YYYY/MM/DD HH:mm'));
            $('.ps-time_status').html('Ends On');
        } else if(row.hasClosed) {
            $('.ps-time_status').html('End');
        }
        //NioApp.Plugins.countdown()
    },
    clipboard: (text) => {
        navigator.clipboard.writeText(text);
    },
    toWei: (amount, decimals = 18) => {
        return new BigNumber(amount.toString()).multipliedBy(new BigNumber("10").pow(new BigNumber(decimals.toString())));
    },
    fromWei: (amount, decimals = 18) => {
        return new BigNumber(amount.toString()).div(new BigNumber("10").pow(new BigNumber(decimals.toString())));
    },
};
$(window).on("load", () => {
    $('[data-toggle="tooltip"]').tooltip()

    //App.init();
   //App.connectWallet(false);
    $(document).on('click', '.connect-web3', function () {
        App.connectWallet(true);
    })
    $(document).on('click', '[data-clipboard=text]', function (e) {
        const text = $(this).data().text;
        /*var copyText = document.querySelector("#input");
        copyText.select();*/
        $(`#${$(this).attr('aria-describedby')} .tooltip-inner`).html('Copied!')
        //$(this).attr('data-bs-original-title', 'Copied!').
        setTimeout(function (){
            $(this).attr('title', 'Copy').tooltip('update')
        }, 50000)
        App.clipboard(text);
    })
    $(document).on('click', '.add-metamask', async function () {
        App.addToMetamask().then(res => {
            if(!res.status){
                alert(res.message)
            }
        });
    })
});
function to_fixed(value) {
    function fixed(num, len = 2) {
        if (num == 0) {
            return "0.00";
        }
        if (!Number(num)) {
            return "--";
        }
        num = num * 1;
        return num.toFixed(len).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    }
    value = value * 1;
    if (value > 1e9) {
        return fixed(value / 1e9) + " B";
    }
    if (value > 1e6) {
        return fixed(value / 1e6) + " M";
    }
    if (value > 1e3) {
        return fixed(value / 1e3) + " K";
    }
    return fixed(value);
}
