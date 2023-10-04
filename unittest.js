
// isObject returns true if the given value is an object
function isObject(value){
    return value === Object(value);
}

// deepStrictEquality compares two objects and returns true if they are equal
//
// two objects are equal if:
// 1. they have the same number of keys
// 2. the keys are the same
// 3. the values the keys point to are the same
// the values are considered the same if they also
// satisfy deepStrictEquality
function deepStrictEquality(a, b){

    // a and b might not be objects, could be primitives
    // if they are primitives, just compare them
    const aIsPrimitive = !isObject(a);
    const bIsPrimitive = !isObject(b);

    // if both a and b are primitives, compare them
    // otherwise if one is object and the other is primitive,
    // they are not equal
    if(aIsPrimitive && bIsPrimitive){
        return a === b;
    } else if( (aIsPrimitive && !bIsPrimitive) || (!aIsPrimitive && bIsPrimitive) ){
        return false;
    }

    // if we get here, both a and b are objects
    // so check if they have the same number of keys
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if(aKeys.length !== bKeys.length){
        return false;
    }

    // if they do have same length, check if the keys are the same
    // if they are, check if the values are the same
    for(let i = 0; i < aKeys.length; i++){
        const key = aKeys[i];
        if(!b.hasOwnProperty(key)){
            return false;
        }

        const aValue = a[key];
        const bValue = b[key];
        if(!deepStrictEquality(aValue, bValue)){
            return false;
        }
    }

    // if we get here, all keys are the same and all values are the same
    return true;
}

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
function testPassed(expected, actual, htmlElement, totalTests, passingTests, failingTestNames, testName, testStatusDiv) {
    totalTests.increment();
    const expectedJson = JSON.stringify(expected);
    const actualJson = JSON.stringify(actual);
    if(deepStrictEquality(expected, actual)) {
        passingTests.increment();
        htmlElement.append("p")
            .text(`Test passed! Expected: ${expectedJson}, Actual: ${actualJson}`)
            .style("color", "green");
    }else{
        failingTestNames.push(testName);
        htmlElement.append("p")
            .text(`Test failed! Expected: ${expectedJson}, Actual: ${actualJson}`)
            .style("color", "red");
    }

    displayTestSuiteData(totalTests, passingTests, failingTestNames, testStatusDiv);
}

function displayTestSuiteData(totalTestsO, passingTestsO, failingTestNames, testStatusDiv) {
    const passingTests = passingTestsO.value;
    const totalTests = totalTestsO.value;
    const passingPercentage = Math.round((passingTests / totalTests) * 100);
    const failingTestsCount = failingTestNames.length;
    const html = `
      Total tests: ${totalTests}
      Passing tests: ${passingTests}
      Failing tests: (${failingTestsCount} tests)
    `;
    testStatusDiv.text(html);
  
    const progressBar = testStatusDiv.select('.progress-bar');
    const progressBarFailed = testStatusDiv.select('.progress-bar-failed');
    if (progressBar.empty()) {
      testStatusDiv.append('div')
        .classed('progress-bar', true)
        .style('width', `${passingPercentage}%`);
    testStatusDiv.append('div')
        .classed('progress-bar-failed', true)
        .style('width', `${100 - passingPercentage}%`);
    } else {
      progressBar.style('width', `${passingPercentage}%`);
    progressBarFailed.style('width', `${100 - passingPercentage}%`);
    }

    const failingTestsTable = testStatusDiv.select('.failing-tests');
    if (failingTestsTable.empty()) {
        const table = testStatusDiv.append('table')
            .classed('failing-tests', true);
        table.append('h2')
            .classed('failing-tests-title', true)
            .text(failingTestsCount <= 0 ? 'No failing tests' : 'Failing tests:');
        table.append('ul').selectAll('li')
            .data(failingTestNames)
            .join('li')
            .text(d => d);
    }else{
        failingTestsTable.select('ul').selectAll('li')
            .data(failingTestNames)
            .join('li')
            .text(d => d);
        
        failingTestsTable.select('.failing-tests-title')
                        .text(failingTestsCount <= 0 ? 'No failing tests' : 'Failing tests:');
    }
  }

// mocks d3's append and attr methods
class MockD3{
    constructor(){
        this.elements = [];
        this.attributes = {};
    }

    append(element){
        this.elements.push(element);
        return this;
    }

    attr(attributeName, attributeValue){
        this.attributes[attributeName] = attributeValue;
        return this;
    }
}