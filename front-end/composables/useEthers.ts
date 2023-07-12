export const useEthers = () => {
  const nuxtApp = useNuxtApp()
  const ethers = nuxtApp.$ethers
  return ethers
}
