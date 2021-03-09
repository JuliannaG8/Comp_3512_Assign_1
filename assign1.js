
document.addEventListener("DOMContentLoaded", async function () {

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
            const response = await fetch("https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php");
            storage = await response.json();
            localStorage.setItem("companies", JSON.stringify(storage));
            loading.classList.toggle("hidden");
            return storage;
        } catch (e) {
            console.error(e);
        }
    }
    async function showList(companies){
        const list = document.querySelector("#company-list");
        list.innerHTML = "";
        for(const company of companies){
            const li = document.createElement("li");
            li.innerHTML = company.name;
            li.setAttribute("symbol",company.symbol)
            li.addEventListener("click", () => showData(company));
            list.appendChild(li);
        }
    }
    const companies = await loadAndStore();
    showList(companies);
    async function retrieveStocks(symbol) {
        try {
            const loading = document.querySelector("#loader2");
            loading.classList.toggle("hidden");
            const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=${symbol}`);
            const stocks = await response.json();
            loading.classList.toggle("hidden");
            return stocks;
        } catch (e) {
            console.error(e);
        }
    }
    function calculateAverage (numArray) {
        let total = 0;
        numArray.forEach(num => total+= num);
        return (total / numArray.length);
    }
    function getMinMaxAvgOfStocks(stocks,stockAttribute) {
        const stockAttributeArray = stocks.map(stock => parseFloat(stock[stockAttribute]));
        stockAttributeArray.sort((a, b) => a < b ? -1 : 1);
        const avg = calculateAverage(stockAttributeArray);
        return {
            min: stockAttributeArray[0],
            max: stockAttributeArray[stockAttributeArray.length - 1],
            avg
        }
    }
    //creating the candlestick chart
    function createCandlestick(stocks) {
        function convertMinMaxAvgToCandlestickData({min,max,avg}) {
            return [avg, avg, min, max];
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
                    convertMinMaxAvgToCandlestickData(getMinMaxAvgOfStocks(stocks,"open")),
                    convertMinMaxAvgToCandlestickData(getMinMaxAvgOfStocks(stocks,"close")),
                    convertMinMaxAvgToCandlestickData(getMinMaxAvgOfStocks(stocks,"high")),
                    convertMinMaxAvgToCandlestickData(getMinMaxAvgOfStocks(stocks,"low"))
                ]
            }]
        };
        const candleContainer = echarts.init(document.querySelector("#candlestick"));
        candleContainer.setOption(options);
    }
    //creating the bar chart
    function createBarChart(company) {
        const barContainer = document.querySelector("#columns");
        if (!!company.financials) {
            const barChart = new Chart(barContainer, {
                type: "bar",
                data: {
                    labels: company.financials.years,
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
        const dates = stocks.map(stock => stock.date);

        const lineContainer = document.querySelector("#line");
        const lineChart = new Chart(lineContainer, {
            type: "line",
            data: {
                labels: dates,
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
                        label: "closing values",
                        ticks: {
                            autoSkip: false,
                            maxTicksLimit: 5
                        }
                    }, {
                        id: "right-y-axis",
                        type: "linear",
                        position: "right",
                        label: "volume values",
                        ticks: {
                            autoSkip: false,
                            maxTicksLimit: 5
                        }
                    }],
                    //advice on ticks from
                    //https://stackoverflow.com/questions/22064577/limit-labels-number-on-chart-js-line-chart
                    xAxes: [{
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 10
                        }

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
    function createMap(latitude,longitude){
        new google.maps.Map(document.querySelector("#map"), {
            center: {lat: latitude, lng: longitude},
            mapTypeId: "satellite",
            zoom: 18
        });
    }
    async function showData(company) {
        createBarChart(company);
        altDescribe(company);
        displayInfo(company);
        financialsTable(company);
        createMap(company.latitude,company.longitude);
        const stockData = await retrieveStocks(company.symbol);
        stockData.sort((a, b) => a.date < b.date ? -1 : 1);
        createLineChart(stockData);
        createCandlestick(stockData);
        stockTable(stockData);
    }
    function formatCurrency (num) {
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(num);
    }
    function stockTableSort(columnToSortBy,stocks) {
        const sortedStocks = stocks.map(stock => {
            return {
                date: stock.date,
                high: stock.high,
                low: stock.low,
                open: stock.open,
                close: stock.close,
                volume: stock.volume
            };
        });
        sortedStocks.sort((a, b) => a[columnToSortBy] < b[columnToSortBy] ? -1 : 1);
        stockTable(sortedStocks);
    }
//ADDED HERE
    //creating the Financials Table
    function stockTable(stocks) {
        const tableElement = document.createElement("table");
        const tableElementContainer = document.querySelector("#stockDetails")
        tableElementContainer.innerHTML = "";
        const tableData = stocks.map(stock => {
            return {
                date: stock.date,
                high: parseFloat(stock.high),
                low: parseFloat(stock.low),
                open: parseFloat(stock.open),
                close: parseFloat(stock.close),
                volume: parseInt(stock.volume)
            };
        });
        createMinMaxAvgTable(tableData);
        function createFirstTableRow(headerTextList) {
            const rowElement = document.createElement("tr");
            headerTextList.forEach(text => {
                const tableHeadElement = document.createElement("th");
                tableHeadElement.textContent = text;
                tableHeadElement.classList.toggle("stockColumn");
                tableHeadElement.addEventListener("click", () => stockTableSort(text.toLowerCase(), tableData));
                rowElement.appendChild(tableHeadElement);
            });
            tableElement.appendChild(rowElement);
        }
        const rowNames = ["Date","High","Low","Open","Close","Volume"];
        createFirstTableRow(rowNames);
        tableData.forEach(stock => {
            const rowElement = document.createElement("tr");
            for (const attribute of rowNames) {
                const columnElement = document.createElement("td");
                if (attribute.toLowerCase() === "date" || attribute.toLowerCase() === "volume") {
                    columnElement.textContent = stock[attribute.toLowerCase()];
                } else {
                    columnElement.textContent = formatCurrency(stock[attribute.toLowerCase()]);
                }
                rowElement.appendChild(columnElement);
            }
            tableElement.appendChild(rowElement);
        });
        tableElementContainer.appendChild(tableElement);
    }
    function financialsTable(company) {
        const tableContainer = document.querySelector("#financial-table");
        tableContainer.innerHTML = "";//emptying table
        if (!!company.financials) {//checking to see if financial data exists
            function buildRow(rowData,rowLabel,formatter= (b)=>b) {
                const rowElement = document.createElement("tr");
                const labelElement = document.createElement("th");
                labelElement.textContent = rowLabel;
                rowElement.appendChild(labelElement);
                rowData.forEach(data => {
                    const dataElement = document.createElement("td");
                    dataElement.textContent = formatter(data);
                    rowElement.appendChild(dataElement);
                });
                return rowElement;
            }
            const table = document.createElement("table");
            const {years, revenue, earnings, assets, liabilities}=company.financials;
            const yearRow = buildRow(years,"Year");
            const revRow = buildRow(revenue,"Revenue",formatCurrency);
            const earnRow = buildRow(earnings,"Earnings",formatCurrency);
            const assetRow = buildRow(assets,"Assets",formatCurrency);
            const liableRow = buildRow(liabilities,"Liabilities",formatCurrency);
            table.append(yearRow,revRow,earnRow,assetRow,liableRow);
            tableContainer.appendChild(table);
        } else {//outputting error message if financial data does not exist
            const errorMsg = document.createElement('p');
            errorMsg.textContent = `${company.name} does not have stored financial data`;
            tableContainer.appendChild(errorMsg);
        }
        }
    function createMinMaxAvgTable(stocks) {
        const tableElement = document.querySelector("#averages");
        tableElement.innerHTML = "";
        function generateTableRow(headerText){
            const rowElement = document.createElement("tr");
            const rowHeader = document.createElement("th");
            rowHeader.textContent = headerText;
            rowElement.appendChild(rowHeader);
            return rowElement;
        }
        const minRowElement = generateTableRow("Minimum");
        const maxRowElement = generateTableRow("Maximum");
        const avgRowElement = generateTableRow("Average");

        const tableObj = {
            min: minRowElement,
            max: maxRowElement,
            avg: avgRowElement
        };
        //iterating through list of attributes in order to get the minimum, maximum, and average values of each
        for (const attribute of ["high", "low", "open", "close", "volume"]){
            const minMaxAvgObj = getMinMaxAvgOfStocks(stocks, attribute);
            //iterating through the minMaxAvgObj in order to create the columns needed, and appends the created columns to
            //the matching key of tableObj
            for (const [minMaxAvgKey,minMaxAvgValue] of Object.entries(minMaxAvgObj)){
                const columnElement = document.createElement("td");
                if (attribute === "volume"){
                    columnElement.textContent = minMaxAvgValue.toFixed(0);
                } else {
                    columnElement.textContent = formatCurrency(minMaxAvgValue);
                }
                tableObj[minMaxAvgKey].appendChild(columnElement);
            }
        }
        tableElement.append(avgRowElement,minRowElement,maxRowElement);
    }
    function changeViews() {
        document.querySelector(".container").classList.toggle("chartView");
        document.querySelectorAll(".view2, .view1").forEach(element => element.classList.toggle("hidden"));
    }
    document.querySelectorAll(".viewChange").forEach(button => button.addEventListener('click', changeViews));
    // await showData(companies[0]);
  
    let timer;
    function showCredits() {
        clearTimeout(timer);
        document.querySelector("span.tooltiptext").style.visibility = "visible";
        timer = setTimeout(() => {
            document.querySelector("span.tooltiptext").style.visibility = "hidden";
        }, 5000);
    }
    document.querySelector("#Credits").addEventListener("mouseover", showCredits);
    function startSearch(){
        const searchParam = document.querySelector("#search-box").value;
        const filteredCompanies = companies.filter(obj => {
            const regex = new RegExp(searchParam, 'gi');
            return obj.symbol.match(regex);
        });
        showList(filteredCompanies);
    }
    document.querySelector("#submit").addEventListener('click', startSearch);
    document.querySelector("#reset").addEventListener('click', doClear);
    function doClear(){
        document.querySelector('#search-box').value = '';
        showList(companies);
    }
});
