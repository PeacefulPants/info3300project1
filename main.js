
// takes in objects with keys `Global_Sales`, `Year`
//
// ensures those keys are numbers by converting them
function preprocess(data){
    return data.map(function(d){
        d.Global_Sales = parseFloat(d.Global_Sales);
        d.Year = parseInt(d.Year);
        return d;
    });
}