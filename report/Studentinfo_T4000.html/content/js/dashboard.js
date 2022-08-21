/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 85.36071428571428, "KoPercent": 14.639285714285714};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.14330357142857142, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Create "], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0015, 500, 1500, "Address Request"], "isController": false}, {"data": [0.001625, 500, 1500, "DELETE Request"], "isController": false}, {"data": [0.0, 500, 1500, "Get address"], "isController": false}, {"data": [0.0, 500, 1500, "GET Request"], "isController": false}, {"data": [0.0, 500, 1500, "Update Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 28000, 4099, 14.639285714285714, 69410.31503571407, 0, 2960838, 69611.0, 146828.7, 162912.35, 272300.9700000018, 9.431458224703146, 6.8436127307044154, 2.112324606981873], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create ", 4000, 452, 11.3, 87687.063, 6261, 2960838, 24701.5, 54766.3, 89869.8, 2955554.98, 1.350944698741021, 0.9722016135725698, 0.3826564052003265], "isController": false}, {"data": ["Debug Sampler", 4000, 0, 0.0, 0.05825000000000001, 0, 3, 0.0, 0.0, 1.0, 1.0, 1.3666938752639, 0.396902449192301, 0.0], "isController": false}, {"data": ["Address Request", 4000, 649, 16.225, 84343.69275000022, 88, 315635, 75271.5, 145129.5, 166860.79999999996, 169990.56999999998, 1.3584294110834934, 0.6109629137733534, 0.6749842061355501], "isController": false}, {"data": ["DELETE Request", 4000, 452, 11.3, 114125.36899999992, 80, 172745, 135672.0, 148898.9, 151550.9, 169081.50999999998, 1.3626637623759679, 0.45280292164478964, 0.3103373567968135], "isController": false}, {"data": ["Get address", 4000, 651, 16.275, 106264.63524999999, 85, 172820, 131507.5, 157701.7, 168146.9, 171630.83, 1.3602522723864368, 0.7257686440214702, 0.19476182365281466], "isController": false}, {"data": ["GET Request", 4000, 1029, 25.725, 36587.243, 722, 2946241, 16473.0, 75744.50000000001, 142719.45, 271205.3399999999, 1.3565276960564046, 2.944437089226457, 0.150505356906676], "isController": false}, {"data": ["Update Request", 4000, 866, 21.65, 56864.14400000007, 89, 2941273, 40475.5, 140257.30000000002, 144984.2, 169729.05999999997, 1.3568557852260115, 0.7911549147267021, 0.4148606439145696], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 452, 11.027079775555013, 1.6142857142857143], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 500, 12.19809709685289, 1.7857142857142858], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1110, 27.079775555013416, 3.9642857142857144], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 83, 2.02488411807758, 0.29642857142857143], "isController": false}, {"data": ["405/Method Not Allowed", 1356, 33.08123932666504, 4.8428571428571425], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 150, 3.659429129055867, 0.5357142857142857], "isController": false}, {"data": ["404/Not Found", 183, 4.464503537448158, 0.6535714285714286], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 265, 6.4649914613320325, 0.9464285714285714], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 28000, 4099, "405/Method Not Allowed", 1356, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1110, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 500, "400/Bad Request", 452, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 265], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create ", 4000, 452, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 189, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 115, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 76, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 71, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["Address Request", 4000, 649, "400/Bad Request", 452, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 169, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 13, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 11, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 4], "isController": false}, {"data": ["DELETE Request", 4000, 452, "405/Method Not Allowed", 452, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get address", 4000, 651, "405/Method Not Allowed", 452, "404/Not Found", 183, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5, "", ""], "isController": false}, {"data": ["GET Request", 4000, 1029, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 530, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 354, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 127, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 7], "isController": false}, {"data": ["Update Request", 4000, 866, "405/Method Not Allowed", 452, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 217, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 114, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 59, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 19], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
