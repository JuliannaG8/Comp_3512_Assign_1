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

    // async function createChart(company){
    //     async function retrieveStocks() {
    //         const symbol = company.symbol;
    //         const response = await fetch(`http://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=${symbol}`);
    //         const stocks = await response.json();
    //         stocks.sort(((a, b) => a.date < b.date ? -1 : 1));
    //         return stocks;
    //     }
    //     const stockData = await retrieveStocks();
    //     console.log(stockData);
    //     const dataset = stockData.map(stock => {
    //         const color = Math.floor(Math.random()*16777215).toString(16);
    //         return {
    //             data: [stock.date, stock.open, stock.close, stock.low, stock.high, stock.volume],
    //             borderColor: color
    //         };
    //     });
    //     const canvas = document.querySelector("#stockDetails");
    //     const stockChart = new Chart(canvas, {
    //         type: "line",
    //         data: {
    //             labels: ["Dates", "Open", "Close", "Low", "High", "Volume"],
    //             datasets: dataset
    //         },
    //         options: {
    //             legend: {
    //                 display: false
    //             }
    //         }
    //     });
    //
    // }
    async function retrieveStocks(symbol) {
                const response = await fetch(`http://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=${symbol}`);
                const stocks = await response.json();
                stocks.sort(((a, b) => a.date < b.date ? -1 : 1));
                return stocks;
            }
    async function createCharts(company) {
        const stockData = await retrieveStocks(company.symbol);
    }
    function changeViews() {
        document.querySelector(".container").classList.toggle("chartView");
        const view2Elements = document.querySelectorAll(".view2");
        view2Elements.forEach(element => element.classList.toggle("hidden"));
        const view1Elements = document.querySelectorAll(".view1");
        view1Elements.forEach(element => element.classList.toggle("hidden"))
    }
    const changeButtons = document.querySelectorAll(".viewChange");
    changeButtons.forEach(button => button.addEventListener('click', changeViews))
    // await createChart(companies[1]);
});