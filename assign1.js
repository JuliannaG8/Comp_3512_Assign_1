document.addEventListener("DOMContentLoaded", async function () {
    async function loadAndStore() {
        function retrieveStorage() {
            return JSON.parse(localStorage.getItem("companies")) || [];
        }
        let storage = retrieveStorage();
        if (storage.length > 0) {
            return storage;
        }
        try {
            const response = await fetch("http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php");
            storage = await response.json();
            localStorage.setItem("companies", JSON.stringify(storage));
        } catch (e) {
            console.error(e);
        }
        return storage;
    }
    const companies = await loadAndStore();
    console.log(companies);

    async function retrieveStocks(symbol) {
        function stockStorage () {
            return JSON.parse(localStorage.getItem(symbol)) || [];
        }
        let stocks = stockStorage();
        if (stocks.length === 0) {
            try {
                const response = await fetch(`http://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=${symbol}`);
                stocks = await response.json();
            } catch (e) {
                console.error(e);
            }
        }
        localStorage.setItem(symbol, JSON.stringify(stocks));
        return stocks;
            }
            function calculateAverage (data) {
                let total = 0;
                data.forEach(stock => total+= Number(stock));
                return (total / data.length);
            }
    async function showData(company) {
        const stockData = await retrieveStocks(company.symbol);
        stockData.sort((a, b) => a.date < b.date ? -1 : 1);
        stockData.forEach(stock => console.log(stock));
        const barContainer = document.querySelector("#columns");
        const view2Line = document.querySelector("#line");
        const averageTable = document.querySelector("#averages");
        const candleContainer = echarts.init(document.querySelector("#candlestick"));
        const stockTable = document.querySelector("#stockDetails");
            console.log(company, stockData[0]);
            const highs = stockData.sort((a, b) => a.high < b.high ? -1 : 1).map(stock => Number(stock.high));
            const opening = stockData.sort((a, b) => a.open < b.open ? -1 : 1).map(stock => Number(stock.open));
            const closing = stockData.map(stock => Number(stock.close));
            const volume = stockData.map(stock => Number(stock.volume));
            const sortClosing = stockData.sort((a, b) => a.close < b.close ? -1 : 1).map(stock => Number(stock.close));
            const lows = stockData.sort((a, b) => a.low < b.low ? -1 : 1).map(stock => Number(stock.low));
            if (company.hasOwnProperty('financials')) {
                const barChart = new Chart(barContainer, {
                type: "bar",
                data: {
                    labels: [2019, 2018, 2017],
                    datasets: [
                        {
                            label: "Revenue",
                            backgroundColor: "#0099cc",
                            data: company.financials.revenue
                        },
                        {
                            label: "Earnings",
                            backgroundColor: "#009933",
                            data: company.financials.earnings
                        },
                        {
                            label: "Assets",
                            backgroundColor: "#cc9900",
                            data: company.financials.assets
                        },
                        {
                            label: "Liabilities",
                            backgroundColor: "#990000",
                            data: company.financials.liabilities
                        }
                    ]
                }
            });
            } else {
                const errorMsg = `${company.name} does not have stored financial data`;
                barContainer.getContext("2d").fillText(errorMsg, 1, 50);
            }
            const lineChart = new Chart(view2Line, {
                type: "line",
                data: {
                    labels: ["2019-01-02", "2019-01-16", "2019-02-01", "2019-02-14", "2019-03-01", "2019-03-15", "2019-03-28"],
                    datasets: [{
                        data: closing,
                        label: "closing",
                        borderColor: "#6699ff",
                        fill: false,
                        yAxisID: "left-y-axis"
                    }, {
                        data: volume,
                        label: "volume",
                        borderColor: "#99ffdd",
                        fill: false,
                        yAxisID: "right-y-axis"
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            id: "left-y-axis",
                            type: 'linear',
                            position: "left",
                            label: "closing values"
                        }, {
                            id: "right-y-axis",
                            type: "linear",
                            position: "right",
                            label: "volume values"
                        }]
                    }
                }
            });
            const options = {
                grid: {
                    height: "80%",
                    width: "90%",
                    bottom: "15%"
                },
                xAxis: {
                    data: ['open', 'close', 'high', 'low']
                },
                yAxis: {
                    // data: [30, 60, 90, 120, 150, 180]
                },
                series: [{
                    type: 'candlestick',
                    data: [
                        [calculateAverage(opening), calculateAverage(opening), opening[0], opening[opening.length - 1]],
                        [calculateAverage(sortClosing), calculateAverage(sortClosing), sortClosing[0], sortClosing[sortClosing.length - 1]],
                        [calculateAverage(highs), calculateAverage(highs), highs[0], highs[highs.length - 1]],
                        [calculateAverage(lows), calculateAverage(lows), lows[0], lows[lows.length - 1]]
                    ]
                }]
            };
            candleContainer.setOption(options);

    }
    function changeViews() {
        document.querySelector(".container").classList.toggle("chartView");
        document.querySelectorAll(".view2, .view1").forEach(element => element.classList.toggle("hidden"));
    }
    document.querySelectorAll(".viewChange").forEach(button => button.addEventListener('click', changeViews));
    await showData(companies[0]);
});