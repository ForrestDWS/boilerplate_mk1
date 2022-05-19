import React, { useReducer } from 'react';
import { VictoryChart, VictoryBar, VictoryTheme } from 'victory';
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
        data: action.payload,
        error: '',
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
        x: item.endTime,
        y: item.temperature,
      };
    });

    const windSpeed = periods.map((item: any) => {
      return {
        x: item.endTime,
        y: item.windSpeed,
      };
    });

    const tileData = periods.map((item: any) => {
      console.log('item', item);
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
  console.log('hour', hour);
  return (
    <div>
      <p>{hour}</p>
      <img src={image} />
      <p>{windDirection}</p>
      <p>{shortForecast}</p>
    </div>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log('STATE: ', state);

  return (
    <div className="App">
      <header className="App-header">
        <p>SpaceX launch data analysis</p>
        <button
          disabled={state.loading}
          onClick={() => action.getLaunches(dispatch)}
        >
          Get Launches
        </button>
        {state.data &&
          state.data.temperatures &&
          state.data.temperatures.length > 0 && (
            <>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={10}
                height={200}
              >
                <VictoryBar
                  style={{ data: { fill: '#c43a31' } }}
                  data={state.data.temperatures}
                  categories={{
                    x: state.data.temperatures.map((item: { x: string }) =>
                      new Date(item.x).getHours()
                    ),
                  }}
                />
              </VictoryChart>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={10}
                height={200}
              >
                <VictoryBar
                  style={{ data: { fill: '#c43a31' } }}
                  data={state.data.windSpeed}
                  categories={{
                    x: state.data.windSpeed.map((item: { x: string }) =>
                      new Date(item.x).getHours()
                    ),
                  }}
                />
              </VictoryChart>
              <div className="tile-parent">
                {state.data.tileData.map((item: any, index: number) => {
                  return WeatherTile(
                    item.endTime,
                    item.icon,
                    item.windDirection,
                    item.shortForecast
                  );
                })}
              </div>
            </>
          )}
      </header>
    </div>
  );
}

export default App;
