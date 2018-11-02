const reportProgress = (verb: string) => {
  let previousPercent = -1
  return (progress: number) => {
    const percent = Math.round(progress * 100)
    if (percent !== previousPercent) {
      previousPercent = percent
      console.log(`${verb}... ${percent}%`)
    }
  }
}

export default reportProgress