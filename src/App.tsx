import React, { useReducer } from 'react';
import { VictoryChart, VictoryBar, VictoryTheme, VictoryAxis } from 'victory';
import './App.css';

const initialState = {
  loading: false,
  data: {},
  error: '',
};

const actionType = {
  GET_LAUNCHES_SUCCESS: 'GET_LAUNCHES_SUCCESS',
  GET_LAUNCHES_LOADING: 'GET_LAUNCHES_LOADING',
  GET_LAUNCHES_ERROR: 'GET_LAUNCHES_ERROR',
};

const reducer = (state: any, action: { type: any; payload: any }) => {
  switch (action.type) {
    case actionType.GET_LAUNCHES_SUCCESS:
      return {
        loading: false,
        data: handle.launchResponse(action.payload),
        error: '',
      };
    case actionType.GET_LAUNCHES_LOADING:
      return {
        loading: true,
        error: '',
      };
    case actionType.GET_LAUNCHES_ERROR:
      return {
        loading: false,
        data: '',
        error: true,
      };
    default:
      return state;
  }
};

const action = {
  getLaunches: (dispatch: (arg0: { type: string; payload: any }) => void) => {
    fetch('https://api.weather.gov/gridpoints/LWX/89,70/forecast/hourly')
      .then((res) => {
        dispatch({ type: actionType.GET_LAUNCHES_LOADING, payload: {} });
        return res.json();
      })
      .then((json) => {
        dispatch({ type: actionType.GET_LAUNCHES_SUCCESS, payload: json });
      })
      .catch((err) => {
        dispatch({ type: actionType.GET_LAUNCHES_ERROR, payload: err });
      });
  },
};

// data: {
//   temperatures: [
//     70, 90, 80
//   ],
//   windSpeed: [
//     5, 10, 20
//   ],
//   windDirection: [
//     'N', 'NE', 'E'
//   ],
//   shortForecast: ['sunny']
// }

const handle = {
  launchResponse: (response: any) => {
    const {
      properties: { periods: rawPeriods },
    } = response;

    const periods = rawPeriods.slice(0, 24);

    const temperatures = periods.map((item: any) => {
      return {
        label: `${item.temperature}°`,
        x: item.endTime,
        y: item.temperature,
      };
    });

    const windSpeed = periods.map((item: any) => {
      return {
        x: item.endTime,
        y: parseInt(item.windSpeed.slice(0, item.windSpeed.length - 4)),
        // label: `${item.windSpeed}`,
      };
    });

    const tileData = periods.map((item: any) => {
      // console.log('item', item);
      return {
        endTime: item.endTime,
        icon: item.icon,
        windDirection: item.windDirection,
        shortForecast: item.shortForecast,
      };
    });

    const shapedData = {
      temperatures,
      windSpeed,
      tileData,
    };
    return shapedData;
  },
};

const WeatherTile = (
  hour: string,
  image: string,
  windDirection: string,
  shortForecast: string
) => {
  const date = new Date(hour);
  const hourString = date.getHours() + ':00';
  // console.log('hour', hour);
  return (
    <div className="weather-tile">
      <p id={'tile-string'}>{hourString}</p>
      <img src={image} />
      <p id={'tile-string'}>{windDirection}</p>
      <p id={'tile-string'}>{shortForecast}</p>
    </div>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log('STATE: ', state);

  return (
    <div className="App">
      <header className="App-header">
        <p>Weather service forcast for Tysons Corner, VA </p>
        <button
          disabled={state.loading}
          onClick={() => action.getLaunches(dispatch)}
        >
          Get Forecast!
        </button>
        {state.data &&
          state.data.temperatures &&
          state.data.temperatures.length > 0 && (
            <>
              <VictoryChart
                scale={{ x: 'time' }}
                theme={VictoryTheme.material}
                domainPadding={10}
                height={200}
              >
                <VictoryBar
                  style={{
                    data: { fill: '#c43a31' },
                    labels: {
                      fontSize: 5,
                    },
                  }}
                  data={state.data.temperatures}
                  categories={{
                    x: state.data.temperatures.map(
                      (item: { x: string }) => `${item.x}`
                    ),
                  }}
                />
                {state.data.temperatures.map(
                  (item: { x: string }, i: number) => {
                    return (
                      <VictoryAxis
                        label={'Time'}
                        fixLabelOverlap
                        key={i}
                        style={{
                          grid: { stroke: 'none' },
                          tickLabels: { fontSize: 5, padding: 1, angle: 60 },
                          axisLabel: { fontSize: 10, padding: 15 },
                        }}
                        tickFormat={(t: any) => {
                          const date = new Date(t);
                          return `${date.getHours()}:00`;
                        }}
                      />
                    );
                  }
                )}
                <VictoryAxis
                  fixLabelOverlap
                  dependentAxis
                  label={'Temperature (F)'}
                  style={{
                    tickLabels: { fontSize: 5, padding: 1 },
                    axisLabel: { fontSize: 10, padding: 15 },
                  }}
                />
              </VictoryChart>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={10}
                height={200}
              >
                <VictoryBar
                  style={{
                    data: { fill: '#c43a31' },
                    labels: {
                      fontSize: 5,
                      padding: -1,
                      angle: -70,
                      fill: '#dfdfdf',
                    },
                  }}
                  data={state.data.windSpeed}
                  categories={{
                    x: state.data.windSpeed.map(
                      (item: { x: string }) => `${item.x}`
                    ),
                  }}
                />
                {state.data.windSpeed.map((item: { x: string }, i: number) => {
                  return (
                    <VictoryAxis
                      label={'Time'}
                      fixLabelOverlap
                      key={i}
                      style={{
                        grid: { stroke: 'none' },
                        tickLabels: { fontSize: 5, padding: 1, angle: 60 },
                        axisLabel: { fontSize: 10, padding: 15 },
                      }}
                      tickFormat={(t: any) => {
                        const date = new Date(t);
                        return `${date.getHours()}:00`;
                      }}
                    />
                  );
                })}
                <VictoryAxis
                  fixLabelOverlap
                  dependentAxis
                  label={'Wind Speed (MPH)'}
                  style={{
                    tickLabels: { fontSize: 5, padding: 1 },
                    axisLabel: { fontSize: 10, padding: 15 },
                  }}
                />
              </VictoryChart>
              <div className="tile-parent">
                {/* {renderWeatherTiles()} */}
                <div className="tile-container">
                  {state.data.tileData.map((item: any, index: number) => {
                    return WeatherTile(
                      item.endTime,
                      item.icon,
                      item.windDirection,
                      item.shortForecast
                    );
                  })}
                </div>
              </div>
            </>
          )}
      </header>
    </div>
  );
}

export default App;
