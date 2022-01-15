import "regenerator-runtime/runtime";
import "core-js/stable";
import axios from "axios";
import { prettyPrintJson } from "pretty-print-json";

const getData = async () => {
  const requestLink = "https://api.spacexdata.com/v3/launches/past";
  const { data } = await axios.get(requestLink);
  const launch_yearData = data.filter(({ launch_year }) => {
    return launch_year === "2018";
  });
  const filterCustomer = launch_yearData.filter(
    ({
      rocket: {
        second_stage: { payloads },
      },
    }) => {
      return payloads.some((item) =>
        item.customers.some(
          (customer) => customer === "NASA" || customer === "NASA (CRS)"
        )
      );
    }
  );

  const sortData = filterCustomer
    .sort((a, b) => b.launch_date_utc.localeCompare(a.launch_date_utc))
    .map(
      ({
        rocket: {
          second_stage: { payloads },
        },
        flight_number,
        mission_name,
      }) => {
        return { flight_number, mission_name, payloads_count: payloads.length };
      }
    )
    .sort((a, b) => b.payloads_count - a.payloads_count);
  return sortData;
};

const render = async (data) => {
  const prepareData = Array.isArray(data) ? data : await data();
  const elem = document.getElementById("out");
  elem.innerHTML = Array.isArray(data)
    ? JSON.stringify(prepareData, {}, 2)
    : prettyPrintJson.toHtml(prepareData, {
        quoteKeys: true,
        indent: 2,
      });
};
module.exports = {
  prepareData: getData,
  renderData: render,
};
