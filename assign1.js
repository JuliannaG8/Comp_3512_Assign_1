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
                stocks.sort(((a, b) => a.date < b.date ? -1 : 1));
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
                console.log(total);
                return (total / data.length);
            }
    async function showData(company) {
        const stockData = await retrieveStocks(company.symbol);
        const barContainer = document.querySelector("#columns");
        const view2LineContainer = document.querySelector("#line");
        const candleContainer = echarts.init(document.querySelector("#candlestick"));
        const stockTable = document.querySelector("#stockDetails");
            console.log(company, stockData[1]);
            const highAvrg = stockData.sort((a, b) => a.high < b.high ? -1 : 1).map(stock => Number(stock.high));
            const openAvrg = stockData.sort((a, b) => a.open < b.open ? -1 : 1).map(stock => Number(stock.open));
            const closeAvrg = stockData.sort((a, b) => a.close < b.close ? -1 : 1).map(stock => Number(stock.close));
            const lowAvrg = stockData.sort((a, b) => a.low < b.low ? -1 : 1).map(stock => Number(stock.low));
            if (company.hasOwnProperty(financials)) {
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
                        [calculateAverage(openAvrg), calculateAverage(openAvrg), openAvrg[0], openAvrg[openAvrg.length - 1]],
                        [calculateAverage(closeAvrg), calculateAverage(closeAvrg), closeAvrg[0], closeAvrg[closeAvrg.length - 1]],
                        [calculateAverage(highAvrg), calculateAverage(highAvrg), highAvrg[0], highAvrg[highAvrg.length - 1]],
                        [calculateAverage(lowAvrg), calculateAverage(lowAvrg), lowAvrg[0], lowAvrg[lowAvrg.length - 1]]
                    ]
                }]
            };
            candleContainer.setOption(options);

    }
    function changeViews() {
        document.querySelector(".container").classList.toggle("chartView");
        document.querySelectorAll(".view2, .view1").forEach(element => element.classList.toggle("hidden"));
    }
    document.querySelectorAll(".viewChange").forEach(button => button.addEventListener('click', changeViews))
    // await createChart(companies[1]);
    await showData(companies[1]);
});