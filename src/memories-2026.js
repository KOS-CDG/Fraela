const photo = (id, aspect, tone) => ({
  id, type: 'photo', src: '', alt: '', aspect, focalPoint: '50% 50%', tone,
})

const video = (id, aspect, tone) => ({
  id, type: 'video', src: '', poster: '', captions: '', label: '', aspect, focalPoint: '50% 50%', tone,
})

export const memories = [
  {
    id: 'opening', title: '', caption: '',
    media: [photo('P01', '4 / 5', 'lilac'), photo('P02', '16 / 10', 'rose')],
  },
  {
    id: 'detail', title: '', caption: '',
    media: [photo('P03', '4 / 3', 'blush'), photo('P04', '4 / 5', 'lilac'), photo('P05', '4 / 5', 'dusty-rose')],
  },
  {
    id: 'first-film', title: '', caption: '', handoff: ['P09', 'V01'],
    media: [
      photo('P06', '3 / 2', 'plum'), photo('P07', '4 / 5', 'rose'), photo('P08', '4 / 5', 'orchid'),
      photo('P09', '9 / 16', 'lilac'), video('V01', '9 / 16', 'purple'),
    ],
  },
  {
    id: 'candids', title: '', caption: '',
    media: [photo('P10', '4 / 5', 'berry'), photo('P11', '3 / 2', 'lilac'), photo('P12', '4 / 5', 'blush')],
  },
  {
    id: 'second-film', title: '', caption: '', handoff: ['P13', 'V02'],
    media: [
      photo('P13', '16 / 9', 'lilac'), video('V02', '16 / 9', 'plum'),
      photo('P14', '4 / 5', 'lilac'), photo('P15', '4 / 5', 'blush'), photo('P16', '16 / 10', 'rose'),
    ],
  },
  {
    id: 'quiet', title: '', caption: '',
    media: [photo('P17', '4 / 5', 'dusty-rose'), photo('P18', '3 / 2', 'orchid'), photo('P19', '4 / 5', 'pale-pink')],
  },
  {
    id: 'montage', title: '', caption: '',
    media: [
      photo('P20', '4 / 5', 'lilac'), photo('P21', '4 / 5', 'rose'), photo('P22', '4 / 5', 'dusty-rose'),
      video('V03', '16 / 9', 'plum'),
    ],
  },
  {
    id: 'closing', title: '', caption: '', letter: '',
    media: [photo('P23', '3 / 2', 'blush'), photo('P24', '4 / 5', 'lilac')],
  },
]
