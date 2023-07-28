using Prism.Events;
using System;
using System.Collections.Generic;

namespace MatthewsApp.API.PrismEvents;

public class EventCaseAnyChange : PubSubEvent<List<Guid>>
{
}
