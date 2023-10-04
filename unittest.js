// build table automates the process of building a table
//
// assumes data is a 1D array of objects
// use className if you want to style the table using css
function buildTable(htmlElement, data, className, title, displayTypeInfo){
    const table = htmlElement.append("table");

    if(title) {
        table.append("caption")
            .text(title);
    }

    const tableHead = table.append("thead");
    const tableBody = table.append("tbody");
    const allKeys = Array.from(new Set(data.map(d => Object.keys(d)).flat()));

    tableHead.append("tr")
        .selectAll("th")
        .data(allKeys)
        .join("th")
        .text(d => d);

    const rows = tableBody.selectAll("tr")
                    .data(data)
                    .join("tr");

    const cells = rows.selectAll("td")
                    .data(d => allKeys.map(key => d[key]))
                    .join("td")
                    .text(d => {
                        if(displayTypeInfo) {
                            return `${d} : ${typeof d}`
                        } else {
                            return d;
                        }
                    });

    if(className) {
        table.attr("class", className);
    }
}

// checks if expected equals actual and modifies given html element
function testPassed(expected, actual, htmlElement) {
    const expectedJson = JSON.stringify(expected);
    const actualJson = JSON.stringify(actual);
    if(expectedJson === actualJson) {
        htmlElement.append("p")
            .text(`Test passed! Expected: ${expectedJson}, Actual: ${actualJson}`)
            .style("color", "green");
    }else{
        htmlElement.append("p")
            .text(`Test failed! Expected: ${expectedJson}, Actual: ${actualJson}`)
            .style("color", "red");
    }
}