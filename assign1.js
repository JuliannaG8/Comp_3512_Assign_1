document.addEventListener("DOMContentLoaded", async function () {
    const companiesURL = "http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php";

    const mainContent = document.querySelector('#company-list');

    async function loadAndStore() {//function to retrieve data, either from local storage or from API
        const loading = document.querySelector("#loader1");
        loading.classList.toggle("hidden");
        function retrieveStorage() {//checking to see if the companies data is already in local storage
            return JSON.parse(localStorage.getItem("companies")) || [];
        }
        let storage = retrieveStorage();
        if (storage.length > 0) {
            loading.classList.toggle("hidden");
            return storage;
        }
        try {
            const response = await fetch("http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php");
            storage = await response.json();
            localStorage.setItem("companies", JSON.stringify(storage));
        } catch (e) {
            console.error(e);
        }
        loading.classList.toggle("hidden");
        return storage;
    }
    const companies = await loadAndStore();
    console.log(companies);

    async function retrieveStocks(symbol) {

        try {
            const loading = document.querySelector("#loader2");
            loading.classList.toggle("hidden");
            const response = await fetch(`http://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=${symbol}`);
            const stocks = await response.json();
            loading.classList.toggle("hidden");
            return stocks;
        } catch (e) {
            console.error(e);
        }
    }
    function calculateAverage (data) {
        let total = 0;
        data.forEach(stock => total+= stock);
        return (total / data.length);
    }
    //creating the candlestick chart
    function createCandlestick(stocks) {
        const highs = stocks.map(stock => Number(stock.high));
        highs.sort((a, b) => a < b ? -1 : 1);
        const opening = stocks.map(stock => Number(stock.open));
        opening.sort((a, b) => a < b ? -1 : 1);
        const closing = stocks.map(stock => Number(stock.close));
        closing.sort((a, b) => a < b ? -1 : 1);
        const lows = stocks.map(stock => Number(stock.low));
        lows.sort((a, b) => a < b ? -1 : 1);
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
                    [calculateAverage(closing), calculateAverage(closing), closing[0], closing[closing.length - 1]],
                    [calculateAverage(highs), calculateAverage(highs), highs[0], highs[highs.length - 1]],
                    [calculateAverage(lows), calculateAverage(lows), lows[0], lows[lows.length - 1]]
                ]
            }]
        };
        const candleContainer = echarts.init(document.querySelector("#candlestick"));
        candleContainer.setOption(options);
    }
    //creating the bar chart
    function createBarChart(company) {
        const barContainer = document.querySelector("#columns");
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
    }
    //creating the line chart
    function createLineChart(stocks) {
        const closing = stocks.map(stock => Number(stock.close));
        const volume = stocks.map(stock => Number(stock.volume));
        const lineContainer = document.querySelector("#line");
        const lineChart = new Chart(lineContainer, {
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
                maintainAspectRatio: false,
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
    }
    function altDescribe(company){
        const header = document.querySelector("#nameAndSymbol");
        const description = document.querySelector("#description2");
        header.textContent = `${company.name} Symbol: ${company.symbol}`;
        description.textContent = company.description;
        document.querySelector("#speak").addEventListener("click", () => {
            const utter = new SpeechSynthesisUtterance(company.description);
            speechSynthesis.speak(utter);
        });
    }
    function displayInfo(company) {
        function displayLogo(){
            const url = `logos/logos/${company.symbol}.svg`;
            const logo = document.querySelector("#logo");
            logo.setAttribute("src", url);
            logo.setAttribute("alt", company.name);
        }
        function showSite() {
            const href = document.querySelector("#site");
            href.setAttribute("href", company.website);
            href.textContent = company.website;
        }
        displayLogo();
        showSite();
        document.querySelector("#companyName").textContent = company.name;
        document.querySelector("#description1").textContent = company.description;
        document.querySelector("#address").textContent = company.address;
        document.querySelector("#symbol").textContent = company.symbol;
        document.querySelector("#sector").textContent = company.sector;
        document.querySelector("#subIndustry").textContent = company.subindustry;
        document.querySelector("#exchange").textContent = company.exchange;
    }
    async function showData(company) {
        const stockData = await retrieveStocks(company.symbol);

        stockData.sort((a, b) => a.date < b.date ? -1 : 1);
        console.log(company, stockData);
        createBarChart(company);
        createLineChart(stockData);
        createCandlestick(stockData);
        altDescribe(company);
        displayInfo(company);
        createTableData(company);
    }
    function currency (num) {
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(num);
    }
//ADDED HERE
    //creating the Table 
    function createTableData(company) {
        if (company.hasOwnProperty('financials')) {
            const financial = company.financials;
            const table = document.querySelector("#financial-table");
            table.innerHTML = "";
            const year = document.createElement("th");
            const revenue = document.createElement("th");
            const earnings = document.createElement("th");
            const assets = document.createElement("th");
            const liabilities = document.createElement("th");
            const yearRow = document.createElement("tr");
            const revRow = document.createElement("tr");
            const earnRow = document.createElement("tr");
            const assetRow = document.createElement("tr");
            const liableRow = document.createElement("tr");
            year.textContent = "Year";
            revenue.textContent = "Revenue";
            earnings.textContent = "Earnings";
            assets.textContent = "Assets";
            liabilities.textContent = "Liabilities";
            yearRow.appendChild(year);
            revRow.appendChild(revenue);
            earnRow.appendChild(earnings);
            assetRow.appendChild(assets);
            liableRow.appendChild(liabilities);

            for (let i = 0; i < financial.years.length; i++) {
                const curYear = document.createElement("td");
                const curRev = document.createElement("td");
                const curEarn = document.createElement("td");
                const curAsset = document.createElement("td");
                const curLiable = document.createElement("td");
                curYear.textContent = financial.years[i];
                curRev.textContent = currency(financial.revenue[i]);
                curEarn.textContent = currency(financial.earnings[i]);
                curAsset.textContent = currency(financial.assets[i]);
                curLiable.textContent = currency(financial.liabilities[i]);
                yearRow.appendChild(curYear);
                revRow.appendChild(curRev);
                earnRow.appendChild(curEarn);
                assetRow.appendChild(curAsset);
                liableRow.appendChild(curLiable);
            }
            table.append(yearRow,revRow,earnRow,assetRow,liableRow);
        } else {
            const errorMsg = `${company.name} does not have stored financial data`;
            document.querySelector("#financials").appendChild(errorMsg);
        }
        }

    function changeViews() {
        document.querySelector(".container").classList.toggle("chartView");
        document.querySelectorAll(".view2, .view1").forEach(element => element.classList.toggle("hidden"));
    }
    document.querySelectorAll(".viewChange").forEach(button => button.addEventListener('click', changeViews));
    await showData(companies[0]);
  
    let timer;
    function showCredits() {
        clearTimeout(timer);
        document.querySelector("span.tooltiptext").style.visibility = "visible";
        timer = setTimeout(() => {
            document.querySelector("span.tooltiptext").style.visibility = "hidden";
        }, 5000);
    }
    document.querySelector("#Credits").addEventListener("mouseover", showCredits);
});
