let data = null;
let series = null;
let data_file = './data/2011_rankings.csv';
let AttributesWanted = ['scores_teaching','scores_international_outlook','scores_industry_income','scores_research','scores_citations'];
let rate = {'scores_teaching':0.3,'scores_international_outlook':0.05,'scores_industry_income':0.025,'scores_research':0.3,'scores_citations':0.325}

function get_min_max(data, attr) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let v = parseInt(d[attr]);
        if (v > max)
            max = v;
        if (v < min)
            min = v;
    });
    console.log('attr', attr, 'min', min, 'max', max);

    return [min, max];
}

function get_set(data, attr) {
    let set = [];
    data.forEach(d => {
        let v = d[attr];
        set.push(v);
    })

    return set;
}

function reset_value(data,attr) {
    data.forEach(d => {
        // d.scores_teaching = d.scores_teaching*rate[0]
        // d.scores_international_outlook = d.scores_international_outlook*rate[1]
        // attr.forEach(function(attr,index){
        //     d.attr = d.attr*rate[index]
        // })
        let coeff = 1
        for (let key in d){
            if (AttributesWanted.includes(key)){
                if (isNaN(d[key])){
                    coeff = coeff - rate[key]
                }
            }
        }
        for (let key in d){
            if (AttributesWanted.includes(key)){
                d[key] = d[key] * parseFloat(rate[key]) / coeff
            }
        }
    })
    return data
}

function inv_reset_value(data,attr) {
    data.forEach(d => {
        let coeff = 1
        for (let key in d){
            if (AttributesWanted.includes(key)){
                if (isNaN(d[key])){
                    coeff = coeff - rate[key]
                }
            }
        }
        for (let key in d){
            if (AttributesWanted.includes(key)){
                d[key] = d[key] / parseFloat(rate[key]) * coeff
            }
        }
    })
    return data
}