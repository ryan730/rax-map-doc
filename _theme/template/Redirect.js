import React from 'react';
import { Map } from 'react-amap';
import { Link } from 'react-router';

export default function Redirect() {
  location.href = `${location.protocol}//${location.host}/components/about`;
}
