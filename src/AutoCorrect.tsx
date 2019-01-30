import React, { Component } from 'react';
import DrawableCanvas from './DrawableCanvas';
import axios from 'axios';
import styled from 'styled-components';

const CanvasWrapper = styled.div`
  text-align: center;
`;

const TextWrapper = styled.div`
  text-align: center;
`;

const ResultText = styled.p`
  font-size: 2rem;
`;

const ResetButton = styled.button`
  background-color: #8ad;
  padding: 10px;
  font-size: 1rem;
`;

const canvasSize = {
  height: Math.min(700, window.innerWidth - 50),
  width: Math.min(700, window.innerWidth - 50),
};

type Language = 'English' | 'Japanese' | 'Chinese';

export default class AutoCorrect extends Component<{}, { lang: Language; res: [string][] }> {
  ink: [number[], number[], number[]][];
  url: { [lang in Language]: string };
  constructor(props) {
    super(props);
    this.ink = [];
    this.state = { lang: 'Chinese', res: [] };
  }

  post = () => {
    const url = {
      English: 'https://inputtools.google.com/request?itc=en-t-i0-handwrit',
      Japanese: 'https://inputtools.google.com/request?itc=ja-t-i0-handwrit',
      Chinese: 'https://inputtools.google.com/request?itc=zh-hans-t-i0-handwrit',
    };
    const data = {
      app_version: 0.4,
      api_level: '537.36',
      device: window.navigator.userAgent,
      input_type: 0, // ?
      options: 'enable_pre_space', // ?
      requests: [
        {
          writing_guide: {
            writing_area_width: canvasSize.width, // canvas width
            writing_area_height: canvasSize.height, // canvas height
          },
          pre_context: '', // confirmed preceding chars
          max_num_results: 1,
          max_completions: 0,
          ink: this.ink,
        },
      ],
    };
    axios.post(url[this.state.lang], data).then(res => {
      if (!res.data[1]) return;
      this.setState({ ...this.state, res: res.data[1][0][1] });
    });
  };

  reset = () => {
    this.ink.splice(0, this.ink.length);
    const cvs = document.getElementsByTagName('canvas')[0];
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    this.setState({ ...this.state, res: [[' ']] });
  };

  render() {
    return (
      <div>
        <CanvasWrapper>
          <DrawableCanvas height={canvasSize.height} width={canvasSize.width} ink={this.ink} onEnd={this.post} />
        </CanvasWrapper>
        <TextWrapper>
          <ResultText>{this.state.res[0]}</ResultText>
          <ResetButton onClick={this.reset}>リセット</ResetButton>
        </TextWrapper>
      </div>
    );
  }
}
