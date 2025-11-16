import React from 'react';
import { GroundingChunk, GroundingMapsChunk, GroundingWebChunk } from '../types';

interface GroundingLinksProps {
  groundingUris: GroundingChunk[];
}

const GroundingLinks: React.FC<GroundingLinksProps> = ({ groundingUris }) => {
  if (!groundingUris || groundingUris.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-inner">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">Sources:</h3>
      <ul className="list-disc pl-5 space-y-2">
        {groundingUris.map((chunk, index) => {
          if ('maps' in chunk) {
            const mapsChunk = chunk as GroundingMapsChunk;
            return (
              <React.Fragment key={`maps-${index}`}>
                <li>
                  <a
                    href={mapsChunk.maps.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    {mapsChunk.maps.title || 'Google Maps Link'}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                {mapsChunk.maps.placeAnswerSources &&
                  mapsChunk.maps.placeAnswerSources.map((source, srcIndex) => (
                    <li key={`maps-source-${index}-${srcIndex}`} className="ml-5 text-sm text-gray-600">
                      <a
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                      >
                        Review: {source.title}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
              </React.Fragment>
            );
          } else if ('web' in chunk) {
            const webChunk = chunk as GroundingWebChunk;
            return (
              <li key={`web-${index}`}>
                <a
                  href={webChunk.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {webChunk.web.title || 'Web Source Link'}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
};

export default GroundingLinks;
