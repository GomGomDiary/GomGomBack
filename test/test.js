// beforeAll(() => {
//   console.log('global beforeAll');
// });
//
// beforeEach(() => {
//   console.log('beforeEach');
// });
//
// afterEach(() => {
//   console.log('afterEach');
// });
//
// afterAll(() => {
//   console.log('afterAll');
// });
// describe('test1', () => {
//   beforeAll(() => {
//     console.log('local beforeAll');
//   });
//   beforeEach(() => {
//     console.log('local beforeEach');
//   });
//   it('test1-1', () => {
//     console.log('test1-1');
//   });
//   it('test1-2', () => {
//     console.log('test1-2');
//   });
//   it('test1-3', () => {
//     console.log('test1-3');
//   });
// });
//
// describe('test2', () => {
//   it('test2-1', () => {
//     console.log('test2-1');
//   });
// });

beforeEach(() => {
  console.log('outer beforeEach');
});

describe('outer describe1', () => {
  beforeEach(() => {
    console.log('inner beforeEach');
  });

  describe('inner describe', () => {
    it('inner it1', () => {
      console.log('inner it1');
    });

    it('inner it2', () => {
      console.log('inner it2');
    });
  });
  // console.log('outer describe1');
});

describe('outer describe2', () => {
  // console.log('outer describe2');
  it('test1', () => {
    console.log('test1');
  });
});
