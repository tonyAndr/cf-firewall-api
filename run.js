const fetch = require("node-fetch");
const fs = require("fs");

const ruleExpression = fs.readFileSync("rules.txt", 'utf8');
const credentials = fs.readFileSync("credentials.txt", 'utf8').replace("\r", '').split("\n");
const email = credentials[0];
const key = credentials[1];
const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Email': email,
    'X-Auth-Key': key
}
const ep_zones = "https://api.cloudflare.com/client/v4/zones";
const ep_filters = "https://api.cloudflare.com/client/v4/zones/{zone}/filters";
const ep_firewall = "https://api.cloudflare.com/client/v4/zones/{zone}/firewall/rules";
const per_page = 25;
// get zones list

// for each zone get firewall list
    // for each firewall rule DELETE

// for each zone create new rule

const main = async (page = 1) => {
    console.log("Page num: ", page);
    let zones = await getZones(page);
    for (const zone of zones.result) {
        if (zone.name.includes("pravo")) {
            continue;
        }
        let rules = await getRules(zone);
        for (const rule of rules.result) {
            let resp = await deleteRule(zone, rule);
            console.log("Rule delete ", zone.name, resp.success)
        }

        let filters = await getFilters(zone);
        for (const fil of filters.result) {
            let resp = await deleteFilter(zone, fil);
            console.log("Filter delete ", zone.name, resp.success)
        }

        let filter = await createFilter(zone);
        let filter_id = '';
        if (!filter.success) {
            filter_id = filter.errors[0].meta.id
            console.log("Filter exists ", zone.name, filter_id);
        } else {
            filter_id = filter.result[0].id
            console.log("Filter Added ", zone.name, filter_id);
        }
        let resp = await addRule(zone, filter_id);
        console.log("AddRule ", zone.name, resp.success);
        // break;
    }
    if (zones.result_info.total_count > (page * per_page)) {
        await main(++page)
    }
}

const getZones = async (page) => {
    const data = {
        per_page,
        page: page
    }
    const url = new URL(ep_zones);
    url.search = new URLSearchParams(data);
    const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers,
        // body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
    return response.json(); // parses JSON response into native JavaScript objects
}

const getRules = async (zone) => {
    const response = await fetch(ep_firewall.replace("{zone}", zone.id), {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers,
        // body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
    return response.json(); // parses JSON response into native JavaScript objects
}

const deleteRule = async (zone, rule) => {
    let data = {delete_filter_if_unused: true};
    const response = await fetch(ep_firewall.replace("{zone}", zone.id) + "/" + rule.id, {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        headers,
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
    return response.json(); // parses JSON response into native JavaScript objects
}

const getFilters = async (zone) => {
    const response = await fetch(ep_filters.replace("{zone}", zone.id), {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers,
        // body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
    return response.json(); // parses JSON response into native JavaScript objects
}

const deleteFilter = async (zone, filter) => {
    const response = await fetch(ep_filters.replace("{zone}", zone.id) + "/" + filter.id, {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        headers,
        // body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
    return response.json(); // parses JSON response into native JavaScript objects
}


const createFilter = async (zone) => {
    let data = [{
        expression: ruleExpression.replace("{dm_name}", zone.name),
        paused: false,
        description: "Filters mobile bots from SM and w/o refs"
    }];
    const response = await fetch(ep_filters.replace("{zone}", zone.id), {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers,
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
    return response.json(); // parses JSON response into native JavaScript objects
}

const addRule = async (zone, filter_id) => {
    let data = [{
        filter: {
            id: filter_id
        },
        action: "challenge",
        description: "bot_killer",
        paused: false
    }];
    const response = await fetch(ep_firewall.replace("{zone}", zone.id), {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers,
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
    return response.json(); // parses JSON response into native JavaScript objects
} 

let result = main();
Promise.resolve(result).then((val) => {console.log("Done")});