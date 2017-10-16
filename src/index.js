import fs from 'fs';
import path from 'path';

import _ from 'lodash';

import { isStream, log } from './lib';
import mapper from './mapper';

const trainFileNames = [
  "data_batch_1.bin",
  "data_batch_2.bin",
  "data_batch_3.bin",
  "data_batch_4.bin",
  "data_batch_5.bin",
];

const testFileNames = [ "data_batch_test.bin" ];

export default  {
  createStream(filename, {highWaterMark}){
    return fs.createReadStream(filename, {highWaterMark});
  },

  createPromise(stream, {mapper, numOfchunk}) {
    const output = [];
    return new Promise((resolve, reject) => {
      const converter = data => output.push(mapper(data));
      const resolver = () => resolve(_.flatten(output));
      try {
        if (isStream(stream)) {
          stream.on('data', log(converter));
          stream.on('end', resolver); 
        }
        else {
          converter(stream);
          resolver();
        }
      }
      catch(e){
        reject(e);
      }
    });
  },

  mapper(chunk) {

  },

  async combine(files, options) {
    const ps = files.map(name => this.createStream(name, options))
                    .map(sr => this.createPromise(sr, options));
    return await Promise.all(ps).then(values => _.flatten(values));
  },

  load(opt={
        dir: path.join(__dirname, 'cifar-10-batches-bin'),
        getFileName : i => `${this.dir}/data_batch_${i}.bin`,
        highWaterMark: 10, 
        numOfEntities: 10,
      }) {

    const trainFiles = _.range(1,6).map(i => opt.getFileName(i));
    const testFiles = opt.getFileName('test'); 

    const inputInfo = {
      cols : 32,
      rows : 32,
      channel : 3,
      valueSize : 1,
    };
    const singleChannelSize = option.rows * option.cols;
    const imageSize = option.valueSize + option.singleChannelSize * option.channel;

    const mapper = (chunk) => {
      const y = chunk[0];
      const X = _.range(channel)
                 .map(i => new Uint8Array(img.slice(valueSize + singlechannelsize * i, valuesize + singlechannelsize * (i+1))));

      return {
        X, y
      }
    };

    const { X_train = X, y_train = y } = combine(trainFiles);
    const { X_test = X, y_test = y } = combine(testFiles);

    return {
      X_train,
      y_train,
      X_test,
      y_test
    }
  }
};
