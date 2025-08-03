// VEHICLE MAP
const vehicleTypeMapping = {
    truck: ["ram", "f-150", "silverado", "tundra", "tacoma", "pickup"],
    suv: ["suv", "crossover", "jeep", "tahoe", "suburban", "explorer", "highlander", "4runner"],
    
};

const svg = d3.select("#chart"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    margin = { top: 50, right: 50, bottom: 60, left: 70 };

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

let sceneIndex = 0;
let scenes;

// load CSV
d3.csv("data/cars2017.csv").then(data => {
    data.forEach(d => {
        d.AverageCityMPG = +d.AverageCityMPG;
        d.AverageHighwayMPG = +d.AverageHighwayMPG;
    });

    scenes = [
        () => scene1(data),
        () => scene2(data),
        () => scene3(data),
        () => scene4(data)
    ];

    scenes[sceneIndex]();

    d3.select("#next").on("click", () => {
        sceneIndex = (sceneIndex + 1) % scenes.length;
        scenes[sceneIndex]();
    });

    d3.select("#prev").on("click", () => {
        sceneIndex = (sceneIndex - 1 + scenes.length) % scenes.length;
        scenes[sceneIndex]();
    });
});

// SCENE 1

function scene1(data) {
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.AverageCityMPG)).nice()
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.AverageHighwayMPG)).nice()
        .range([innerHeight, 0]);

    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));

    g.selectAll("circle").data(data)
        .join("circle")
        .attr("cx", d => x(d.AverageCityMPG))
        .attr("cy", d => y(d.AverageHighwayMPG))
        .attr("r", 4)
        .attr("fill", "steelblue");

    // Axis Labels
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .text("Average City MPG");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Average Highway MPG");

    g.append("text")
        .attr("class", "annotation")
        .attr("x", 0)
        .attr("y", -10)
        .text("Smaller cars achieve higher MPG in both city and highway driving.");
}

//SCENE TWO 

function scene2(data) {
    svg.selectAll("*").remove();

    function classify(make) {
        const lower = make.toLowerCase();
        if (vehicleTypeMapping.truck.some(keyword => lower.includes(keyword))) return "Truck";
        if (vehicleTypeMapping.suv.some(keyword => lower.includes(keyword))) return "SUV";
        return "Sedan";
    }

    const grouped = ["Sedan", "SUV", "Truck"].map(type => {
        const vals = data.filter(d => classify(d.Make) === type);
        return { type, avg: d3.mean(vals, d => d.AverageCityMPG) || 0 };
    });

    const x = d3.scaleBand()
        .domain(grouped.map(d => d.type))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(grouped, d => d.avg)]).nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.selectAll("rect").data(grouped)
        .join("rect")
        .attr("x", d => x(d.type))
        .attr("y", d => y(d.avg))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.avg))
        .attr("fill", "orange");

    // axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Vehicle Type");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Average City MPG");

    // Annotation
    svg.append("text")
        .attr("class", "annotation")
        .attr("x", margin.left)
        .attr("y", margin.top - 20)
        .text("Sedans outperform SUVs and trucks in average city MPG.");
}

// SCENE THREEE

function scene3(data) {
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.AverageCityMPG)).nice()
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.AverageHighwayMPG)).nice()
        .range([innerHeight, 0]);

    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));

    const isHybridOrElectric = d =>
        d.Fuel.toLowerCase().includes("electric") || d.Fuel.toLowerCase().includes("hybrid");

    g.selectAll("circle").data(data)
        .join("circle")
        .attr("cx", d => x(d.AverageCityMPG))
        .attr("cy", d => y(d.AverageHighwayMPG))
        .attr("r", 4)
        .attr("fill", d => isHybridOrElectric(d) ? "red" : "#ccc");

    // Axis Labels
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .text("Average City MPG");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Average Highway MPG");

    g.append("text")
        .attr("class", "annotation")
        .attr("x", 0)
        .attr("y", -10)
        .text("Hybrids & electrics achieve far higher MPG than traditional cars.");
}

// SCENE FOUR

function scene4(data) {
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.AverageCityMPG)).nice()
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.AverageHighwayMPG)).nice()
        .range([innerHeight, 0]);

    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));

    const tooltip = d3.select("body").append("div")
        .attr("class", "scene-tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "4px 8px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    g.selectAll("circle").data(data)
        .join("circle")
        .attr("cx", d => x(d.AverageCityMPG))
        .attr("cy", d => y(d.AverageHighwayMPG))
        .attr("r", 4)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`<strong>${d.Make}</strong><br/>Fuel: ${d.Fuel}<br/>City MPG: ${d.AverageCityMPG}<br/>Highway MPG: ${d.AverageHighwayMPG}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    // axis labels
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .text("Average City MPG");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Average Highway MPG");

    // Annotation
    g.append("text")
        .attr("class", "annotation")
        .attr("x", 0)
        .attr("y", -10)
        .text("Exploration mode: Hover over points to see details.");
}
