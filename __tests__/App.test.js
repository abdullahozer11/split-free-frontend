import React from 'react';
import renderer from 'react-test-renderer';
import RootLayout from "../src/app/_layout";

describe('<RootLayout />', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<RootLayout />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
