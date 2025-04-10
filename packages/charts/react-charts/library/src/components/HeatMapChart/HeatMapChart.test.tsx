jest.mock('react-dom');
import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import toJson from 'enzyme-to-json';
import { act } from 'react-dom/test-utils';

import { HeatMapChartProps, HeatMapChart } from './index';
import { FluentProvider } from '@fluentui/react-provider';
import { conditionalDescribe, conditionalTest, isTimezoneSet } from '../../utilities/TestUtility.test';
const { Timezone } = require('../../../scripts/constants');
const env = require('../../../config/tests');

beforeAll(() => {
  // https://github.com/jsdom/jsdom/issues/3368
  global.ResizeObserver = class ResizeObserver {
    public observe() {
      // do nothing
    }
    public unobserve() {
      // do nothing
    }
    public disconnect() {
      // do nothing
    }
  };
});

// Wrapper of the HeatMapChart to be tested.
let wrapper: ReactWrapper<HeatMapChartProps> | undefined;
const originalRAF = window.requestAnimationFrame;

function sharedBeforeEach() {
  Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: (callback: FrameRequestCallback) => callback(0),
  });
}

function sharedAfterEach() {
  if (wrapper) {
    wrapper.unmount();
    wrapper = undefined;
  }

  // Do this after unmounting the wrapper to make sure if any timers cleaned up on unmount are
  // cleaned up in fake timers world
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((global.setTimeout as any).mock) {
    jest.useRealTimers();
  }
  window.requestAnimationFrame = originalRAF;
}

const stringPoints: string[] = ['p1', 'p2'];
const datePoints: Date[] = [new Date('2020-03-03'), new Date('2020-03-04')];

const HeatMapDateStringData: HeatMapChartProps['data'] = [
  {
    value: 100,
    legend: 'Execllent (0-200)',
    data: [
      {
        x: datePoints[0],
        y: stringPoints[0],
        value: 50,
        rectText: 50,
        ratio: [50, 2391],
        descriptionMessage: 'a good day to start with in Texas with best air quality',
      },
      {
        x: datePoints[1],
        y: stringPoints[1],
        value: 25,
        rectText: 25,
        ratio: [25, 2479],
        descriptionMessage: `Due to unexpected heavy rain, all the pollutants are washed
        off and people of alaska are hoping for more of this days`,
      },
    ],
  },
];

const HeatMapStringDateData: HeatMapChartProps['data'] = [
  {
    value: 100,
    legend: 'Execllent (0-200)',
    data: [],
  },
  {
    value: 200,
    legend: 'Nasty',
    data: [
      {
        x: stringPoints[0],
        y: datePoints[0],
        value: 50,
        rectText: 50,
        ratio: [50, 2391],
        descriptionMessage: 'a good day to start with in Texas with best air quality',
      },
      {
        x: stringPoints[1],
        y: datePoints[1],
        value: 25,
        rectText: 25,
        ratio: [25, 2479],
        descriptionMessage: `Due to unexpected heavy rain, all the pollutants are washed
      off and people of alaska are hoping for more of this days`,
      },
    ],
  },
];

conditionalDescribe(isTimezoneSet(Timezone.UTC) && env === 'TEST')('HeatMapChart snapShot testing', () => {
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }

    // Do this after unmounting the wrapper to make sure if any timers cleaned up on unmount are
    // cleaned up in fake timers world
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((global.setTimeout as any).mock) {
      jest.useRealTimers();
    }
  });
  it('renders HeatMapChart correctly', async () => {
    await act(async () => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
      await new Promise(resolve => setTimeout(resolve));
      wrapper.update();
    });
    const tree = toJson(wrapper!, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });

  it('renders corretly even when data is not present for some group', async () => {
    await act(async () => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapStringDateData} // first group has no data in it
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['pink', 'yellow']}
        />,
      );
      await new Promise(resolve => setTimeout(resolve));
      wrapper.update();
    });
    const tree = toJson(wrapper!, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });

  it('renders hideLegend correctly', async () => {
    await act(async () => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          hideLegend={true}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
      await new Promise(resolve => setTimeout(resolve));
      wrapper.update();
    });
    const tree = toJson(wrapper!, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });

  it('renders hideTooltip correctly', async () => {
    await act(async () => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          hideTooltip={true}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
      await new Promise(resolve => setTimeout(resolve));
      wrapper.update();
    });
    const tree = toJson(wrapper!, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });

  it('renders yAxisTickFormat correctly', async () => {
    await act(async () => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          yAxisTickFormat={'/%d'}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
      await new Promise(resolve => setTimeout(resolve));
      wrapper.update();
    });
    const tree = toJson(wrapper!, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });

  it('should render HeatMapChart correctly when the layout direction is RTL', () => {
    wrapper = mount(
      <div dir="rtl">
        <HeatMapChart
          data={HeatMapDateStringData}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />
      </div>,
    );
    const tree = toJson(wrapper, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });

  it('should render HeatMapChart correctly in dark theme', () => {
    wrapper = mount(
      <FluentProvider theme={{ colorNeutralBackground1: '#ccc' }}>
        <HeatMapChart
          data={HeatMapDateStringData}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />
      </FluentProvider>,
    );
    const tree = toJson(wrapper, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });
});

describe('HeatMapChart - basic props', () => {
  beforeEach(sharedBeforeEach);
  afterEach(sharedAfterEach);

  it('Should not mount legend when hideLegend true ', () => {
    act(() => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          hideLegend={true}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
    });
    const hideLegendDOM = wrapper!.getDOMNode().querySelectorAll('[class^="legendContainer"]');
    expect(hideLegendDOM!.length).toBe(0);
  });

  it('Should mount legend when hideLegend false ', () => {
    act(() => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
    });
    const hideLegendDOM = wrapper!.getDOMNode().querySelectorAll('[class^="legendContainer"]');
    expect(hideLegendDOM).toBeDefined();
  });

  it('Should mount callout when hideTootip false ', () => {
    act(() => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
    });
    const hideLegendDOM = wrapper!.getDOMNode().querySelectorAll('[class^="ms-Layer"]');
    expect(hideLegendDOM).toBeDefined();
  });

  it('Should not mount callout when hideTootip true ', () => {
    act(() => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
          hideTooltip={true}
        />,
      );
    });
    const hideLegendDOM = wrapper!.getDOMNode().querySelectorAll('[class^="ms-Layer"]');
    expect(hideLegendDOM.length).toBe(0);
  });
});

describe('Render calling with respective to props', () => {
  it('No prop changes', () => {
    const props = {
      data: HeatMapDateStringData,
      domainValuesForColorScale: [0, 600],
      rangeValuesForColorScale: ['lightblue', 'darkblue'],
    };
    const component = mount(<HeatMapChart {...props} />);
    expect(component).toMatchSnapshot();
    component.setProps({ ...props });
    expect(component).toMatchSnapshot();
  });

  it('prop changes', () => {
    const props = {
      data: HeatMapDateStringData,
      domainValuesForColorScale: [0, 600],
      rangeValuesForColorScale: ['lightblue', 'darkblue'],
      hideLegend: true,
    };
    const component = mount(<HeatMapChart {...props} />);
    component.setProps({ ...props, hideTooltip: true });
    expect(component.props().hideTooltip).toBe(true);
  });
});

describe('HeatMapChart - mouse events', () => {
  beforeEach(sharedBeforeEach);
  afterEach(sharedAfterEach);

  conditionalTest(isTimezoneSet(Timezone.UTC) && env === 'TEST')(
    'Should render callout correctly on mouseover',
    async () => {
      await act(async () => {
        wrapper = mount(
          <HeatMapChart
            data={HeatMapDateStringData}
            domainValuesForColorScale={[0, 600]}
            rangeValuesForColorScale={['lightblue', 'darkblue']}
          />,
        );
        await new Promise(resolve => setTimeout(resolve));
        wrapper.update();
        wrapper.find('rect').at(1).simulate('mouseover');
        await new Promise(resolve => setTimeout(resolve));
        wrapper.update();
      });
      const tree = toJson(wrapper!, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    },
  );
});

describe('Render empty chart aria label div when chart is empty', () => {
  it('No empty chart aria label div rendered', () => {
    act(() => {
      wrapper = mount(
        <HeatMapChart
          data={HeatMapDateStringData}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
    });
    const renderedDOM = wrapper!.findWhere(node => node.prop('aria-label') === 'Graph has no data to display');
    expect(renderedDOM!.length).toBe(0);
  });

  it('Empty chart aria label div rendered', () => {
    act(() => {
      wrapper = mount(
        <HeatMapChart
          data={[]}
          domainValuesForColorScale={[0, 600]}
          rangeValuesForColorScale={['lightblue', 'darkblue']}
        />,
      );
    });
    const renderedDOM = wrapper!.findWhere(node => node.prop('aria-label') === 'Graph has no data to display');
    expect(renderedDOM!.length).toBe(1);
  });
});
