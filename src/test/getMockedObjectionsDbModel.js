const noop = () => ({})

const getMockedObjectionsDbModel = () => ({
  query: noop,
  patch: noop,
  update: noop,
  insert: noop,
  withGraphFetched: noop,
  withGraphJoined: noop,
  modifiers: noop,
  where: noop,
  whereIn: noop,
  orderBy: noop,
  find: noop,
  findOne: noop,
  first: noop,
  last: noop,
})


module.exports = getMockedObjectionsDbModel
