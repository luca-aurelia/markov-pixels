declare module 'color-convert' {
  interface ColorConvert {
    rgb: {
      hsl: {
        (red: number, green: number, blue: number): number[]
      }
    }
  }

  const colorConvert: ColorConvert
  export default colorConvert
}