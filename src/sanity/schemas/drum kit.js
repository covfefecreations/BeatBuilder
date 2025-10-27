export default {
  name: 'drumKit',
  title: 'Drum Kit',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { 
      name: 'pads', 
      title: 'Pads', 
      type: 'array', 
      of: [{
        type: 'object',
        fields: [
          { name: 'sound', title: 'Sound Name', type: 'string' },
          { name: 'active', title: 'Active', type: 'boolean', initialValue: false },
          { name: 'velocity', title: 'Velocity', type: 'number', initialValue: 1 }
        ]
      }]
    }
  ]
}
