import api from '.'
import {
  isCommuteResults,
  parseAddresses,
  type CommuteResult,
} from '~core/commute'

export const loadCommutes = async (
  input: string[],
): Promise<CommuteResult[]> => {
  const addresses = parseAddresses(input)
  const { data, error } = await api.commute.durations
    .post({ addresses }, { fetch: { signal: AbortSignal.timeout(15_000) } })
    .catch(() => {
      throw new Error(
        'Commutes could not be loaded. Check that the API is running and try again.',
      )
    })
  if (
    error ||
    !data ||
    data.status !== 'success' ||
    !isCommuteResults(data.payload.results)
  ) {
    throw new Error(
      'Commutes could not be loaded. Check that the API is running and try again.',
    )
  }
  if (
    data.payload.results.some(
      (result, index) => result.address !== addresses[index],
    ) ||
    data.payload.results.length !== addresses.length
  ) {
    throw new Error(
      'The commute response did not match your destinations. Please try again.',
    )
  }
  return data.payload.results
}
