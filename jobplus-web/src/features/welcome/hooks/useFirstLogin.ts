export function useFirstLogin() {
  const isFirstTime = !localStorage.getItem('jobplus_welcome_seen')
  const markAsSeen = () => localStorage.setItem('jobplus_welcome_seen', 'true')
  return { isFirstTime, markAsSeen }
}
