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
    fetch('https://api.spacexdata.com/v4/rockets')
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

const handle = {
  launchResponse: (response: any) => {
    const shapedData = response.map((item: any) => {
      return {
        id: item.id,
        x: item.name,
        y: item.success_rate_pct,
      };
    });
    return shapedData;
  },
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

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
        {state.data && state.data.length > 0 && (
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={10}
            height={200}
          >
            <VictoryBar
              style={{ data: { fill: '#c43a31' } }}
              data={state.data}
              categories={{
                x: state.data.map((item: { x: string }) => item.x),
              }}
            />
          </VictoryChart>
        )}
      </header>
    </div>
  );
}

export default App;
