/**
 * Day-by-day for each camp. Realistic Girona routes from Anthony's
 * playbook. Distances and elevation are approximate — published as
 * indicative, sharpened in the final week before the camp.
 */

import type { CampSlug } from "@/lib/db/schema";

export interface ItineraryDay {
  day: number;
  title: string;
  ride: string;
  distance: string;
  elevation: string;
  description: string;
  highlights: string[];
}

export const ITINERARIES: Record<CampSlug, ItineraryDay[]> = {
  road: [
    {
      day: 1,
      title: "Arrivals & shakedown",
      ride: "Banyoles lake loop",
      distance: "45 km",
      elevation: "350 m",
      description:
        "Pickup from Girona airport in the morning. Bikes built, fits dialled, then a steady spin around Lake Banyoles to shake the legs out and figure out the two pace groups. Back to the house — pool, gardens, the rest of the afternoon's yours.",
      highlights: [
        "Airport transfer from Girona",
        "Bike build assistance & fit check",
        "Group sorting: Chill & Fast",
      ],
    },
    {
      day: 2,
      title: "Els Àngels",
      ride: "Els Àngels & the back roads home",
      distance: "85 km",
      elevation: "1,400 m",
      description:
        "The local climb every Girona pro has done a thousand times. Long. Even gradient. The view at the top is why people move here. Coffee at the Sanctuari, then drop down through the Empordà and roll home along the quiet Ter river road.",
      highlights: [
        "10 km tempo climb",
        "Coffee stop at the Sanctuari",
        "Roll-back through Empordà countryside",
      ],
    },
    {
      day: 3,
      title: "Mare de Déu del Mont",
      ride: "Banyoles → Beuda → Mare de Déu del Mont",
      distance: "105 km",
      elevation: "2,200 m",
      description:
        "The big day. A long warm-up through the foothills, then the real climb — 12 km, properly steep at the top, the kind of summit you tell people about for the rest of the year. Both groups all day. Follow car with spares, gels, and the second-coffee fund.",
      highlights: [
        "12 km mountain finish",
        "Follow car & in-ride nutrition",
        "Coffee stop in Beuda",
      ],
    },
    {
      day: 4,
      title: "Coast day",
      ride: "Costa Brava out-and-back",
      distance: "100 km",
      elevation: "1,100 m",
      description:
        "Drop east to the coast on the rolling roads that link Girona to the Mediterranean. Coffee in a fishing village, then the long pull back home in the afternoon light. Active recovery legs welcome — there's a shorter option that loops back via Bordils.",
      highlights: [
        "Mediterranean coffee stop",
        "Long pull home through Empordà",
        "Shorter option for legs that need it",
      ],
    },
    {
      day: 5,
      title: "Rocacorba",
      ride: "Rocacorba & farewell roll",
      distance: "70 km",
      elevation: "1,400 m",
      description:
        "The legend. Quiet roads out to Pujarnol, then 11 km of the climb every pro in town uses for testing. Time it. Ride it easy. Your call — both groups regroup at the top. Easy roll home, quick clean-up, airport transfers in the afternoon.",
      highlights: [
        "Rocacorba — the test piece",
        "Group regroup at the summit",
        "Airport transfers in the afternoon",
      ],
    },
  ],
  gravel: [
    {
      day: 1,
      title: "Arrivals & dirt shakedown",
      ride: "Ter river paths",
      distance: "40 km",
      elevation: "300 m",
      description:
        "Airport pickup. Bikes built. An easy roll along the gravel paths that line the Ter river — mostly flat, mostly fast, gives the new arrivals a feel for Girona dirt. Group sorting on the way. Back to the house — pool, gardens, the rest of the afternoon's yours.",
      highlights: [
        "Airport transfer",
        "Tyre-pressure clinic & bike checks",
        "Group sorting: Chill & Fast",
      ],
    },
    {
      day: 2,
      title: "La Garrotxa volcanic zone",
      ride: "Banyoles → Santa Pau via volcanic gravel",
      distance: "75 km",
      elevation: "1,500 m",
      description:
        "North into the Garrotxa Natural Park. The trails wind through dormant volcanoes, beech forests, and medieval villages you'd otherwise drive past. Coffee in Santa Pau — cobbles, tiny square, perfect. Properly technical singletrack inside the park; the Chill group takes the wider fire roads.",
      highlights: [
        "Volcanic park trails",
        "Beech forest singletrack",
        "Coffee in Santa Pau old square",
      ],
    },
    {
      day: 3,
      title: "Empordà vineyards",
      ride: "Vineyard tracks of the Alt Empordà",
      distance: "85 km",
      elevation: "1,200 m",
      description:
        "East across farm tracks, vineyard service roads, and the dirt that connects every winery in the region. A long, flat run home through the afternoon. Easy day on the legs. Big day on the camera.",
      highlights: [
        "Vineyard service roads",
        "Open Empordà farm country",
        "Mostly flat, fast & sociable",
      ],
    },
    {
      day: 4,
      title: "Forest day",
      ride: "Les Gavarres forest network",
      distance: "70 km",
      elevation: "1,400 m",
      description:
        "Tight, technical forest trails through Les Gavarres. Cork oaks. Singletrack. The kind of riding that earned Girona its gravel reputation. Two groups: Fast takes the techy lines, Chill takes the wider trails. Coffee stop deep in the forest.",
      highlights: [
        "Cork-oak singletrack",
        "Two-group split for tech sections",
        "Coffee stop deep in the forest",
      ],
    },
    {
      day: 5,
      title: "Coast & farewell",
      ride: "Costa Brava coastal gravel",
      distance: "55 km",
      elevation: "600 m",
      description:
        "Last ride: the coastal gravel paths that drop down toward the Med. Short. Photogenic. Exactly the right finale for the legs you'll have by now. Easy roll home, quick clean-up, airport transfers in the afternoon.",
      highlights: [
        "Coastal gravel paths",
        "Short & scenic — legs-friendly",
        "Airport transfers in the afternoon",
      ],
    },
  ],
};
